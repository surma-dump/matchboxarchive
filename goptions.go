package main

import (
	"fmt"
	"net/url"
	"strings"

	"gopkg.in/amz.v1/aws"
	"gopkg.in/amz.v1/s3"
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

type S3Credentials struct {
	AccessKey, SecretKey string
}

func (s *S3Credentials) MarshalGoption(v string) error {
	fields := strings.Split(v, ":")
	if len(fields) != 2 {
		return fmt.Errorf("Invalid credential format. Expected `accessKey:secretKey`")
	}
	s.AccessKey, s.SecretKey = fields[0], fields[1]
	return nil
}

func (s *S3Credentials) Auth() aws.Auth {
	return aws.Auth{
		AccessKey: s.AccessKey,
		SecretKey: s.SecretKey,
	}
}

type S3Bucket struct {
	Region     aws.Region
	Bucketname string
}

func (s *S3Bucket) MarshalGoption(v string) error {
	fields := strings.Split(v, ":")
	if len(fields) != 2 {
		return fmt.Errorf("Invalid bucket format. Expected `region:name`")
	}

	var ok bool
	s.Region, ok = aws.Regions[fields[0]]
	if !ok {
		return fmt.Errorf("Invalid region %s", fields[0])
	}

	s.Bucketname = fields[1]
	return nil
}

func (s *S3Bucket) Bucket(auth aws.Auth) *s3.Bucket {
	return s3.New(auth, s.Region).Bucket(s.Bucketname)
}
