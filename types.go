package main

import "image"

//go:generate gen

//+gen slice:"Where"
type Field struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

//+gen slice:"Select[RemoteImageItem]"
type ImageItem struct {
	Key   string
	Type  string
	Image image.Image
}

type RemoteImageItem struct {
	URL  string `json:"url"`
	Type string `json:"type"`
}
