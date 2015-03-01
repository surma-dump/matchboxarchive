package main

//go:generate gen

//+gen slice:"Where"
type Field struct {
	Name string `json:"name"`
	Type string `json:"type"`
}
