package main

import "net/http"

func authenticate(w http.ResponseWriter, r *http.Request) {
	LogError(w, http.StatusForbidden, "Not implemented")
}

func login(w http.ResponseWriter, r *http.Request) {
	LogError(w, http.StatusForbidden, "Not implemented")
}
