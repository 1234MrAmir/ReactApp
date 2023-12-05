const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Notes");
const { body, validationResult } = require("express-validator");
// We are following CRUD(Create, Read, Update, Delete) method for this application in notes authentication

// CREATE
// ROUTE 1: Add a note using : Post "api/notes/addnotes" (login required)
router.post("/addnotes",fetchUser,
  [body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description","Descriptions should be at least 5 characters").isLength({ min: 5 }),], async (req, res) => {
      try {   
    //  destructuring
     const {title, description, tag} = req.body;
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const notes = new Note({
      title, description, tag, user: req.user.id
    })
    const SaveNotes = await notes.save();
    res.json(SaveNotes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal sever error' });
  }
  });

  //READ
  // ROUTE 2: Get all the notes using : get "api/notes/fetchallnotes" (login required)
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal sever error' });
}
});


  //UPDATE
  // ROUTE 3: Update and existing note using : put "api/notes/updatenote/:id" (login required)
  router.put("/updatenote/:id",fetchUser, async (req, res) => {
    // destructuring
     const {title, description, tag} = req.body
     try {
      // Create a new note object for the updations in older note
     const NewNote = {};
     if(title){NewNote.title = title};
     if(description){NewNote.description = description};
     if(tag){NewNote.tag = tag};

     // Find the note to be updated and upadte it.
     let note =await Note.findById(req.params.id) // yeh id wahi hai jiska hame note update karna hai as(/updatenote/:id).
     if(!note){return res.status(404).send('Not Found')}
      
     if(note.user.toString() !== req.user.id){
      // (note.user.toString()) notes me save hui user ki id h and (req.user.id) user jo data base me alag se save hua h us user ki id h jo dono same h
      return res.status(401).send('Not Allowed')
    }
    console.log(note.user.toString());
    console.log(req.user.id);
     note = await Note.findByIdAndUpdate(req.params.id, {$set:NewNote}, {new:true});
     res.json({note})
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal sever error' });
    }
    })


    //DELETE
  // ROUTE 4: Delete and existing note using : delete "api/notes/deletenote/:id" (login required)
  router.delete("/deletenote/:id",fetchUser, async (req, res) => {
    // destructuring
     const {title, description, tag} = req.body
     try {
      

      // Find the note to be delete and delete it.
     let note =await Note.findById(req.params.id) 
     if(!note){return res.status(404).send('Not Found')}
      
     // Allow deletions  only if the user owns this note
     if(note.user.toString() !== req.user.id){
       return res.status(401).send('Not Allowed')
    }
      note = await Note.findByIdAndDelete(req.params.id);
     res.json({"Success": "Note has been deleted", note: note})
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal sever error' });
    }

    })

module.exports = router;
