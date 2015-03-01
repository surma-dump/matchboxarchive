package main

import (
	"bytes"
	"fmt"
	"net/http"
	"time"

	"image"
	_ "image/jpeg"
	"image/png"

	"github.com/nfnt/resize"
	"github.com/surma/httptools"
	"gopkg.in/amz.v1/s3"
)

func createMatchbox(w http.ResponseWriter, r *http.Request) {

}

func updateMatchbox(w http.ResponseWriter, r *http.Request) {

}

const ThumbWidth = 256

func processImage(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vw := w.(httptools.VarsResponseWriter)

	img, _, err := image.Decode(r.Body)
	if err != nil {
		LogError(w, http.StatusBadRequest, "Could not decode image: %s", err)
		return
	}

	thumb := resize.Resize(ThumbWidth, 0, img, resize.Bilinear)

	basename := fmt.Sprintf("%d", time.Now().UnixNano())

	vw.Vars()["images"] = ImageItemSlice{
		{
			Key:   basename + ".png",
			Type:  "fullsize",
			Image: img,
		},
		{
			Key:   basename + ".thumb.png",
			Type:  "thumb",
			Image: thumb,
		},
	}
}

func uploadImages(w http.ResponseWriter, r *http.Request) {
	vw := w.(httptools.VarsResponseWriter)
	bucket := vw.Vars()["bucket"].(*s3.Bucket)
	images := vw.Vars()["images"].(ImageItemSlice)

	for _, img := range images {
		buf := &bytes.Buffer{}
		if err := png.Encode(buf, img.Image); err != nil {
			LogError(w, http.StatusInternalServerError, "Could not encode image: %s", err)
			return
		}

		if err := bucket.PutReader(img.Key, buf, int64(buf.Len()), "image/png", s3.PublicRead); err != nil {
			LogError(w, http.StatusInternalServerError, "Could not upload image: %s", err)
			return
		}
	}

	vw.Vars()["results"] = []interface{}{
		images.SelectRemoteImageItem(func(i ImageItem) RemoteImageItem {
			return RemoteImageItem{
				Type: i.Type,
				URL:  bucket.URL(i.Key),
			}
		}),
	}
}
