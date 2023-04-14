## About

#### This project use json-server to build a simple api

## Authen

Current harcode for username & password: admin@gmail.com/123456
Api login: POST: http://localhost:8000/api/v1/login

## Users

Path: http://localhost:8000/api/v1/users

Method:
GET /users
GET /users/1
POST /users
PUT /users/1
PATCH /users/1
DELETE /users/1

Filter:
GET /users?title=json-server&author=typicode
GET /users?id=1&id=2

Paging:
GET /users?\_page=7
GET /users?\_page=7&\_limit=20

Sort:
GET /users?\_sort=views&\_order=asc
GET /users/1/comments?\_sort=votes&\_order=asc

## Run

`yarn start`
