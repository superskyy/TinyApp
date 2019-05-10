const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const bcrypt = require('bcrypt');
// const saltRounds = 12;

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.set('view engine', 'ejs');



const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
	const templateVars = {
		username: req.cookies["username"]
	}
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
	urls: urlDatabase,
	username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//GET register
app.get("/register", (req, res) => {
	// console.log({username: undefined});
  const templateVars = { username: req.cookies["username"], error: undefined}
  res.render("register", templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
  	shortURL: req.params.shortURL, 
  	longURL: urlDatabase[req.params.shortURL],
  	username: req.cookies['username']
  };
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
	// const username = req.body.username
	// const password = bcrypt.hashSync(req.body.password, saltRounds)
	const ids = generateRandomString();
	const emails = req.body.email;
	const passwords = req.body.password;

	let emailExists = false;
	for (let i in users) {
		if (users[i].email === emails){
			emailExists = true;
		}
	} 
	if (!emails || !passwords) {
		return res.send("Please fill out the fields")
	} 
	else if (emailExists) {
	 	return res.send("The email already exists")
	 }

	res.cookie("password", passwords);
  	res.cookie("id", ids);
  	res.cookie("username", emails);
	res.redirect("/urls")

	users[ids] = {
		id: ids, 
		email: emails, 
		password: passwords}
})

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortString = generateRandomString();
  urlDatabase[shortString] = req.body.longURL;
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/delete", (req, res) => {
	const shortURL = req.params.shortURL;
	delete urlDatabase[shortURL];
	res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;
	res.redirect('/urls/');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post('/login', function (req, res) {
  const username = req.body.username;
  const email = username;
  const password = req.body.password;
  let loggedInUser = null;
	for (let userID in users) {
	  let user = users[userID]
	  if (email === user.email && password === user.password){
		loggedInUser = user;
		break;
	  }
	}
	if (!loggedInUser) {
	  res.send("Email and/or password does not match, try again!", 403)
	  return;
	}  

  res.cookie("username", username);
  res.redirect("/urls/");
});

app.post('/logout', function (req, res) {
	res.clearCookie('username');
	res.redirect("/urls/");
});

function generateRandomString() {
	const random = Math.random().toString(36).substring(2, 8);
	return random;
};

//error code 404
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});


