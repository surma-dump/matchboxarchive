package main

import "net/http"

func authenticate(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("Authorization") != "Token "+options.Password {
		LogError(w, http.StatusForbidden, "Bad password")
		return
	}
}

func login(w http.ResponseWriter, r *http.Request) {
	LogError(w, http.StatusForbidden, "Not implemented")
}
