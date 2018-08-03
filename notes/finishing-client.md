## Client side survey creation

- Now we can either go back to backend, to create some endpoints for sendgrid webhook, to make sure whenever user clicks on a btn, it gives some feedback to our server. Or we can work on frontend component to create new survey!

> Workflow

- Create survey is 2 stage process =>

`surveystark.com/surveys/new`

    - Header will have logo/brandname, add credits, credits, logout
    - Survey title, subject line, email body, recipient list, cancel & next btn
    - On clicking next btn, user can review the filled form, there are back & submit btn

- For the user to navigate to this form, put a + btn on dashboard
- This dashboard will show list of surveys and a + btn



## Material Icons
Refer => https://materializecss.com/

- Add the link to client/index.html for accessing icons


## Navigation with the Link tag
- Link tag by react-router-dom
- Give to property, redirecting it to "/surveys/new"

