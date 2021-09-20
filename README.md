# mobot_api

API for the MoBot application which notifies you of new Moodle assignments

## GET /

Responds with public key for now. Soon to change

## POST /scrape

If a resource's completion tickbox is checked, we will not return it to conserver resources and optimise speed

Request format:

```
{
    username: string,
    password: string, //base64 string, encrypted with public key
    relevantCourses: string, //';' delimited course page URLs
}
```

Response:
_200_

```
{

}
```
