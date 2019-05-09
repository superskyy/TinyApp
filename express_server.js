var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

app.set('view engine', 'ejs');

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
  res.render("urls_index", templateVars)
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

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

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
})

app.post('/urls/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL
	const longURL = req.body.longURL
	urlDatabase[shortURL] = longURL
	res.redirect('/urls/')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post('/login', function (req, res) {
  const username = req.body.username
  res.cookie("username", username)
  res.redirect("/urls/")
})

app.post('/logout', function (req, res) {
	res.clearCookie('username')
	res.redirect("/urls/")
})

function generateRandomString() {
	const random = Math.random().toString(36).substring(2, 8);
	return random;
}


