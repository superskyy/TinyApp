// NPM MODULES //
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// MIDDLEWARE //
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ["key1"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// DATABASE USERS //
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
  },
  "user3RandomID" : {
  	id: "user3RandomID", 
    email: "mike@amazon.ca", 
    password: "a"
  }
}

// DATABASE URL //
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


// ROUTES //

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Render page for adding a new short url 
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]
  const templateVars = {
  	user: users, 
  	id: req.session.user_id
  }
  if (user === undefined) {
	  res.redirect("/login");
  } else {
    return res.render("urls_new", templateVars);
  }
});

// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
// });

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]
  console.log(user_id, 'user_id')
  console.log(users, 'users')
  let templateVars = { 
		urls: urlsForUser(req.session.user_id),
		user: users,
		id: req.session.user_id
  }
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/id", (req, res) => {
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//GET register
app.get("/register", (req, res) => {
  const templateVars = { 
  	user: users,
  	id: req.session.user_id
  }
  res.render("register", templateVars)
})

//GET Login page
app.get("/login", (req, res) => {
	const user_id = req.session.id
  const user = users[user_id]
	const templateVars = { 
		user: users,
		id: req.session.user_id 
	}
  res.render("login", templateVars)
})


app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.id
  const user = users[user_id]
  const shortURL = req.params.shortURL;
  if (user_id === user) {
    let templateVars = { 
    	shortURL: shortURL, 
    	longURL: urlDatabase[shortURL].longURL,
    	user: users,
    	id: req.session.user_id
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("Access Denied")
  }
});

app.post("/register", (req, res) => {
	// const username = req.body.username
	
	let ids = generateRandomString();
	let emails = req.body.email;
	let passwords = req.body.password;
  const hashedPassword = bcrypt.hashSync(passwords, 10);
	let emailExists = false;
	for (let i in users) {
		if (users[i].email === emails){
			emailExists = true;
		}
	} 
  	if (!emails || !passwords) {
  		return res.send("Please fill out the fields")
  	} else if (emailExists) {
	 	return res.send("The email already exists")
	 }
  req.session.user_id = ids;
	users[ids] = {
		id: ids, 
		email: emails, 
		password: hashedPassword
  }

	res.redirect("/urls")
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: longURL, 
    userID: req.session.user_id
  };
  let templateVars = { 
    shortURL: shortURL, 
    longURL: req.body.longURL, 
    users: users, 
    user_id: req.session.user_id
  }
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
	const shortURL = req.params.shortURL;
	delete urlDatabase[shortURL];
	res.redirect('/urls');
});

// SHORT URL //
app.post('/urls/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = {longURL: longURL};
	res.redirect("/urls/");
});



app.post('/login', (req, res) => {
  const email = req.body.email;
  const userId = emailLookup(email);
  const password = req.body.password;
  console.log(userId, 'login userId');
  if (!userId) {
  	res.send("Email not match, try again! 403");
  } else if (!bcrypt.compareSync(password, users[userId].password)){
  	res.send("Password does not match, try again!403");
  } else {

  req.session.user_id = userId;
  res.redirect("/urls");
  }
});

app.post('/logout', (req, res) => {
	res.session = {};
	res.redirect('/login');
});

//Functions
function generateRandomString() {
	const random = Math.random().toString(36).substring(2, 8);
	return random;
};

function urlsForUser(id) {
	let loggedURLs = {};
	for (let url in urlDatabase) {
		if (urlDatabase[url].userID = id) {
			loggedURLs[url] = urlDatabase[url];
		}
	}
	return loggedURLs;
}

function emailLookup(email){
  for (userId in users){
    if (email === users[userId].email){
      return userId;
    }
  }
}
//error code 404
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});