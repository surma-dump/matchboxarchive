package main

import (
	"fmt"
	"net/url"

	"gopkg.in/mgo.v2"
)

type MongoDB struct {
	Address string
	*mgo.Database
}

func (m *MongoDB) MarshalGoption(v string) error {
	u, err := url.Parse(v)
	if err != nil {
		return fmt.Errorf("Coult not parse MongoDB URL: %s", err)
	}
	if u.Scheme != "mongodb" {
		return fmt.Errorf("MongoDB URL must have `mongodb` scheme")
	}
	if u.Path == "" || u.Path == "/" {
		return fmt.Errorf("MongoDB URL must specify a database name")
	}

	s, err := mgo.Dial(v)
	if err != nil {
		return fmt.Errorf("Could not connect to MongoDB: %s", err)
	}
	m.Address = v
	m.Database = s.DB("")
	return nil
}
