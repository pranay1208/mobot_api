# MoBot

API for the MoBot application which notifies you of new Moodle assignments. Currently completes a scrape in between 2-5 seconds with axios-based login

## Local Testing
To test locally, you need to set up a .env file in the root of the folder. It should like 
```
MOODLE_USERNAME="username" //replace username with your moodle username
MOODLE_PASSWORD="password" //replaces password with your moodle password
```

Once you have cloned the repository, also run `npm i` to download all dependencies

To run the scraper you can use `npm run scrape ...args` where args is the PHP course ID of the courses you would like to scrape.

The PHP course id can be found in the URL of the course's Moodle page (it looks like `https://moodle.hku.hk/course/view.php?id=XXXXX`)

The following command will return the moodle resources for the following 3 courses that are provided

```
npm run scrape 12345 23456 34567
```

## Running Server Locally
You can start the express server using the `npm run start` command. Make sure to set the `PORT` environment variable to the port that the server should run on.
You will also need to set up a public and private key in the .env for encrypting and decrypting passwords

### GET /

Responds with public key for now. Soon to be moved to a new endpoint

### POST /scrape

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
        sectionTitle: string,
        completed: boolean,
        comments: string | null
    },
    ...
]
```

_4XX_ : For incorrect requests made by user

_5XX_ : For server/internal errors
