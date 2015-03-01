package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/surma/httptools"
	"gopkg.in/mgo.v2/bson"
)

func generateMatchboxSearchQuery(w http.ResponseWriter, r *http.Request) {
	vw := w.(httptools.VarsResponseWriter)
	qry := bson.M{}
	vw.Vars()["query"] = qry

	if err := r.ParseForm(); err != nil {
		LogError(w, http.StatusBadRequest, "Could not parse query: %s", err)
	}

	for _, f := range r.Form["filter"] {
		fields := strings.Split(f, ":")
		if len(fields) != 2 {
			LogError(w, http.StatusBadRequest, "Invalid filter expression: %s", f)
			return
		}
		field, value := fields[0], fields[1]

		if _, ok := qry[field]; !ok {
			qry[field] = bson.M{}
		}
		if _, ok := qry[field].(bson.M)["$in"]; !ok {
			qry[field].(bson.M)["$in"] = []string{}
		}
		qry[field].(bson.M)["$in"] = append(qry[field].(bson.M)["$in"].([]string), value)
	}

	for _, f := range r.Form["exclude"] {
		fields := strings.Split(f, ":")
		if len(fields) != 2 {
			LogError(w, http.StatusBadRequest, "Invalid exclude expression: %s", f)
			return
		}
		field, value := fields[0], fields[1]

		if _, ok := qry[field]; !ok {
			qry[field] = bson.M{}
		}
		if _, ok := qry[field].(bson.M)["$nin"]; !ok {
			qry[field].(bson.M)["$nin"] = []string{}
		}
		qry[field].(bson.M)["$nin"] = append(qry[field].(bson.M)["$nin"].([]string), value)
	}

	if v := r.FormValue("limit"); v != "" {
		i, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			LogError(w, http.StatusBadRequest, "Invalid limit expression: %s", v)
			return
		}
		vw.Vars()["limit"] = int(i)
	}

	if v := r.FormValue("skip"); v != "" {
		i, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			LogError(w, http.StatusBadRequest, "Invalid skip expression: %s", v)
			return
		}
		vw.Vars()["skip"] = int(i)
	}
	vw.Vars()["paginate"] = true
}

func generateMatchboxIdQuery(w http.ResponseWriter, r *http.Request) {
	vw := w.(httptools.VarsResponseWriter)
	qry := bson.M{}
	vw.Vars()["query"] = qry

	strid := vw.Vars()["1"].(string)
	if !bson.IsObjectIdHex(strid) {
		LogError(w, http.StatusBadRequest, "Invalid id format: %s", strid)
		return
	}
	qry["_id"] = bson.ObjectIdHex(strid)
}

func generateFieldSearchQuery(w http.ResponseWriter, r *http.Request) {

}

func generateFieldIdQuery(w http.ResponseWriter, r *http.Request) {

}

func queryDatabase(w http.ResponseWriter, r *http.Request) {
	vw := w.(httptools.VarsResponseWriter)

	query := vw.Vars()["query"]
	limit, hasLimit := vw.Vars()["limit"]
	skip, hasSkip := vw.Vars()["skip"]

	qry := options.MongoDB.C("matchbox").Find(query)
	total, err := qry.Count()
	if err != nil {
		LogError(w, http.StatusInternalServerError, "Could not count results: %s", err)
		return
	}

	if hasSkip {
		qry = qry.Skip(skip.(int))
	}
	if hasLimit {
		qry = qry.Limit(limit.(int))
	}

	var results []interface{}
	if err := qry.All(&results); err != nil {
		LogError(w, http.StatusInternalServerError, "Could not query database: %s", err)
		return
	}

	vw.Vars()["results"] = results
	vw.Vars()["total"] = total
}

func jsonify(w http.ResponseWriter, r *http.Request) {
	vw := w.(httptools.VarsResponseWriter)

	paginate, _ := vw.Vars()["paginate"].(bool)

	var response interface{}
	if paginate {
		response = bson.M{
			"total":   vw.Vars()["total"],
			"results": vw.Vars()["results"],
		}

		if limit, ok := vw.Vars()["limit"]; ok {
			response.(bson.M)["limit"] = limit
		}

		if skip, ok := vw.Vars()["skip"]; ok {
			response.(bson.M)["skip"] = skip
		}
	} else {
		response = vw.Vars()["results"].([]interface{})[0]
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		LogError(w, http.StatusInternalServerError, "Could not serialize response: %s", err)
	}
}

func createMatchbox(w http.ResponseWriter, r *http.Request) {

}

func updateMatchbox(w http.ResponseWriter, r *http.Request) {

}

func LogError(w http.ResponseWriter, code int, msgfmt string, params ...interface{}) {
	log.Printf(msgfmt, params...)
	http.Error(w, http.StatusText(code), code)
}
