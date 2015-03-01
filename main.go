package main

import (
	"log"
	"net/http"
	"os"

	"github.com/surma/httptools"
	"github.com/voxelbrain/goptions"
)

var (
	options = struct {
		Listen   string        `goptions:"-l, --listen, description='Address to bind to'"`
		MongoDB  *MongoDB      `goptions:"-m, --mongodb, description='Address of MongoDB server', obligatory"`
		Password string        `goptions:"-p, --password, description='Password for protected API'"`
		Help     goptions.Help `goptions:"-h, --help, description='Show this help'"`
	}{
		Listen: "localhost:" + Getenv("PORT", "5000"),
	}
)

func Getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func main() {
	goptions.ParseAndFail(&options)

	publicAPI := httptools.NewRegexpSwitch(map[string]http.Handler{
		"/matchbox/?": httptools.L{
			httptools.SilentHandler(http.HandlerFunc(generateMatchboxSearchQuery)),
			httptools.SilentHandler(http.HandlerFunc(queryDatabase)),
			http.HandlerFunc(jsonify),
		},
		"/matchbox/([0-9a-f]+)": httptools.L{
			httptools.SilentHandler(http.HandlerFunc(generateMatchboxIdQuery)),
			httptools.SilentHandler(http.HandlerFunc(queryDatabase)),
			http.HandlerFunc(jsonify),
		},
		"/field/?": httptools.L{
			httptools.SilentHandler(http.HandlerFunc(listFields)),
			http.HandlerFunc(jsonify),
		},
		"/field/([_a-z]+)": httptools.L{
			httptools.SilentHandler(http.HandlerFunc(showField)),
			http.HandlerFunc(jsonify),
		},
		"/login/?": httptools.L{
			http.HandlerFunc(login),
		},
	})

	protectedAPI := httptools.L{
		httptools.SilentHandler(http.HandlerFunc(authenticate)),
		httptools.NewRegexpSwitch(map[string]http.Handler{
			"/matchbox/?": httptools.MethodSwitch{
				"POST": http.HandlerFunc(createMatchbox),
			},
			"/matchbox/([0-9a-f]+)": httptools.MethodSwitch{
				"PUT": http.HandlerFunc(updateMatchbox),
			},
		}),
	}

	log.Printf("Starting webserver on %s...", options.Listen)
	err := http.ListenAndServe(options.Listen, httptools.MethodSwitch{
		"GET":  publicAPI,
		"POST": protectedAPI,
		"PUT":  protectedAPI,
	})
	if err != nil {
		log.Fatalf("Could not start webserver: %s", err)
	}

}
