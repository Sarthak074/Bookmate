import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Bookmate",
  password: "sarthak123",
  port: 5432,
});

db.connect();

let notes = [];

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// get methods
app.get("/", async (req, res) => {
  try {
    const result = await db.query("select * from books order by ratings desc");
    notes = result.rows;

    res.render("index.ejs", {
      noteItems: notes,
    });
  } catch (err) {
    console.log(err);
  }
});

// adding new notes
app.post("/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/addNotes", async (req, res) => {
  console.log(req.body);
  var isbn = req.body.isbn;
  const title = req.body.title;
  const note = req.body.note;
  const ratings = req.body.ratings;
  const src = "https://covers.openlibrary.org/b/isbn/" + isbn + "-L.jpg";
  db.query(
    "insert into books(name,isbn,ratings,note,src) values($1,$2,$3,$4,$5)",
    [title, isbn, ratings, note, src]
  );
  res.redirect("/");
});

// View notes
let viewNotes = [];

app.post("/view", async (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  const result = await db.query("select name,note from books where id=$1", [
    id,
  ]);
  viewNotes = result.rows;
  res.render("view.ejs", {
    notes: viewNotes,
  });
});

// Update notes
let update = [];

app.post("/update", async (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  const result = await db.query("select * from books where id=$1", [id]);
  update = result.rows;
  res.render("update.ejs", {
    notes: update,
  });
});

app.post("/updateNotes", async (req, res) => {
  const isbn = req.body.isbn;
  const title = req.body.title;
  const note = req.body.note;
  const ratings = req.body.ratings;
  const id = req.body.id;
  await db.query(
    "update books set isbn=$1, name=$2, note=$3, ratings=$4 where id=$5",
    [isbn, title, note, ratings, id]
  );
  res.redirect("/");
});


// Delete notes
app.post("/delete", async (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  db.query("delete from books where id=$1", [id]);
  res.redirect("/");
});

// Setting up server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
