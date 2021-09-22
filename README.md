# mobot_api

API for the MoBot application which notifies you of new Moodle assignments. Currently completes a scrape in between 8-10 seconds (for 1 course) with puppeteer-based login serving as the largest bottleneck

## GET /

Responds with public key for now. Soon to change

## POST /scrape

If a resource's completion tickbox is checked, we will not return it to conserve resources and optimise speed

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
[
    {
        name: string,
        courseUrl: string,
        resourceUrl: string,
        type: ModuleType,
        dueDate: string | null,
        sectionTitle: string
    },
    ...
]
```
