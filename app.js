//prefixes of implementation that we want to test
 window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 
 //prefixes of window.IDB objects
 window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
 window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
 
 if (!window.indexedDB) {
	window.alert("Your browser doesn't support a stable version of IndexedDB.")
 }
 
 var objStoreName = "AllNotes";
 var db;
 var request = window.indexedDB.open("MyNotesDB", 5);
 
 request.onerror = function(event) {
	console.log("error: ");
 };
 
 request.onsuccess = function(event) {
	db = request.result;
	console.log("success: "+ db);
	$('#tblBody').empty();
	listNotes();
 };
 
 request.onupgradeneeded = function(event) {
	var db = event.target.result;
	var objectStore;
	if(!db.objectStoreNames.contains(objStoreName)) {
		objectStore = db.createObjectStore(objStoreName, {keyPath: "noteId", autoIncrement : true});
	}
	
 }
 //viewing all the messages
 function listNotes() {
	$('#reuestNote').hide();
	var objectStore = db.transaction(objStoreName).objectStore(objStoreName);
	var count = 0;
	objectStore.openCursor().onsuccess = function(event) {
		
		var cursor = event.target.result;
		if (cursor) {
			var row = '<tr><td><a href="#" onClick="display('+cursor.key+');">' + cursor.value.subject + '</a></td><td>' + cursor.value.message.length + '</td><td>' + cursor.value.date + '</td><td><button onClick="remove('+cursor.key+');">Delete</button></td><td><button onClick="modify('+cursor.key+');">Edit</button></td></tr>';
			$('tbody#tblBody').append(row);
			count = count + 1;
			cursor.continue();
		} else {
			// alert("No more entries!");
		}
		$("#count").html(count);
		if(count == 0)
		{
			$('#reuestNote').show();
		}
	};
 }
 // addinng new note
 function add() {
	
	var msg = document.getElementById('txtMessage').value;
	var sub = document.getElementById('txtSubject').value;
	var auth = document.getElementById('txtAuthor').value;
	var date = new Date();
	var n = date.toLocaleString();
	// validation for text
	if(msg==""||!isNaN(msg)){
		alert("Please enter data into MESSAGE FIELD to continue");
	}
	else if(sub==""||!isNaN(sub))
	{
		alert("Please enter data into SUBJECT FIELD to continue");
	} else if(auth==""||!isNaN(auth))
	{
		alert("Please enter data into AUTHOR FIELD to continue");
	}
	else{
		msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		sub = sub.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		auth = auth.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		var request = db.transaction([objStoreName], "readwrite")
			.objectStore(objStoreName)
			.add({ message: msg, subject: sub, author: auth, date: n });

		request.onsuccess = function(event) {
			clearForm(false);
			$('#tblBody').empty();
			listNotes();
		};

		request.onerror = function(event) {
			alert("Unable to add data to your database! ");
		}
	}
 }
 // removing a specific note
 function remove(id) {
	var request = db.transaction([objStoreName], "readwrite")
	.objectStore(objStoreName)
	.delete(id);
	
	request.onsuccess = function(event) {
	   $('#tblBody').empty();
	   listNotes();
	};
 }
 // editing a specific message
 function modify(id){
	var transaction = db.transaction([objStoreName]);
	var objectStore = transaction.objectStore(objStoreName);
	var request = objectStore.get(id);	
	request.onerror = function(event) {
	   alert("Unable to retrieve data from database!");
	};
	request.onsuccess = function(event) {
	   if(request.result) {
		   $('#txtMessage').val(request.result.message);
		   $('#txtSubject').val(request.result.subject);
		   $('#txtAuthor').val(request.result.author);
		   $('#btnEditNote').prop('disabled',false);
		   $('#btnAddNote').prop('disabled',true);
		   // remove(id);
		   $('#btnEditNote').click(function(){	
				var msg = document.getElementById('txtMessage').value;
				var sub = document.getElementById('txtSubject').value;
				var auth = document.getElementById('txtAuthor').value;
				var date = new Date();
				var key = id;
				var n = date.toLocaleString();
				var request = db.transaction([objStoreName], "readwrite")
					.objectStore(objStoreName)
					.put({ noteId:key, message: msg, subject: sub, author: auth, date: n });

				request.onsuccess = function(event) {
					clearForm(false);
					$('#tblBody').empty();
					listNotes();
				};

				request.onerror = function(event) {
					alert("Unable to add data to your database! ");
				}
						
		   })
		   
	   } else {
		  alert("No Notes found in your database!");
	   }
	};
 }
 
 function clearForm(editFlag){
	$('#txtMessage').val('');
	$('#txtSubject').val('');
	$('#txtAuthor').val('');
	$('#btnEditNote').prop('disabled',!editFlag);
	$('#btnAddNote').prop('disabled',editFlag);
 }

$('#btnEditNote').prop('disabled',true);
$('#btnAddNote').prop('disabled',false);
 // displaying the message individually
 
 function display(id) {
	var transaction = db.transaction([objStoreName]);
	var objectStore = transaction.objectStore(objStoreName);
	var request = objectStore.get(id);	
	request.onerror = function(event) {
	   alert("Unable to retrieve data from database!");
	};
	request.onsuccess = function(event) {
	   if(request.result) {
		   $('#noteDetail').html('<table class="table table-bordered"><th colspan="2" align="center">Message Description</th><tr><td>' + 'Author Name: </td><td>' + request.result.author + '</td><tr><td>'+ ' Message: </td><td>'+ request.result.message+ '</td></tr><tr><td>'+ 'Subject: </td><td>' + request.result.subject +'</td></tr><tr><td>'+'Date: </td><td>'+ request.result.date+'</td></tr></table>');
	   } else {
		  alert("No Notes found in your database!");
	   }
	};
 }