//this is the model code , where all the data is stored.
	CONTACTS = {
		contactsObject : {},
		add: function( contact ){
			this.contactsObject[contact.id] = contact;
		},
		remove: function( id ){
			delete this.contactsObject[id];
		},
		update: function(id, contact){
			this.contactsObject[id] = contact;
		},
		get: function(id){
			return this.contactsObject[id];
		},
		deleteAll: function(id){
			 this.contactsObject = {};
		}
	};
	
	var contact = function( id,name, phone, emailId ){
		this.id = id;
		this.contact_name = name;
		this.contact_phone = phone;
		this.contact_email = emailId;
	}

//Here all the codes relating to commiting the data to the REST sercvice will be implemented
var PERSIST = {
		xuser : "anandharshan@gmail.com",
		getContacts : function(){
		$.ajax({
    	type:'GET',
   		 url:'http://ui-proj.practodev.in/contacts',
    	headers: {
        "X-USER":this.xuser
   		}
		}).done(function(data) { 
			var contactsArray = data.contacts;
			CONTACTS.deleteAll();
			for(var i=0, len=data.contacts.length; i < len; i++){
				 CONTACTS.add(contactsArray[i]);
			}
			VIEW.renderTable();
		});
	   },
	   
	   getSearchedContacts : function(searchString){
			$.ajax({
				type:'GET',
				url:'http://ui-proj.practodev.in/contacts?q=' + searchString,
				headers: {
				"X-USER":this.xuser
				}
				}).success(function(data) { 
					var contactsArray = data.contacts;
					CONTACTS.deleteAll();
					for(var i=0, len=data.contacts.length; i < len; i++){
						CONTACTS.add(contactsArray[i]);
				}
				VIEW.reRenderTable();
			});
	   },
	   updateContact : function(id,name,phonenumber,email) {
			$.ajax({
				type:'PUT',
				url:'http://ui-proj.practodev.in/contacts/'+ id,
				data: {'contact_name': name, 'contact_phone':phonenumber , 'contact_email':email },
				headers: {
				"X-USER":this.xuser
				},
				error: function (request, status, error) {
					alert(request.responseText);
				},
				success: function(data) { 
					CONTACTS.update(data.contacts.id,data.contacts);
					VIEW.reRenderTable();
				}			
				});
	   },  
	   addContacts: function( name, phonenumber, email) {
			$.ajax({
				type:'POST',
				url:'http://ui-proj.practodev.in/contacts',
				data: {'contact_name':name, 'contact_phone':phonenumber , 'contact_email':email },
				headers: {
				"X-USER":this.xuser
				},
				error: function (request, status, error) {
					VIEW.displayError(request.responseText);
				},
				success: function(data) { 
					VIEW.clearContact();
					VIEW.hideAddorEditDiv();
				    CONTACTS.add(data.contacts);
					VIEW.reRenderTable();
				}
				});
	   },
	   deleteContacts: function(id) {
			$.ajax({
				type:'DELETE',
				url:'http://ui-proj.practodev.in/contacts/'+ id,
				headers: {
				"X-USER":this.xuser
				}
				}).done(function(data) { 
					CONTACTS.remove(id);
					VIEW.reRenderTable();
			});
	   }
};

//Here all the Data regarding the Displaying Logic will be written	
var VIEW ={

	getContactlist : function(){
		PERSIST.getContacts();
	 },

	addContactToList : function( name, phonenumber, email) {
		PERSIST.addContacts(name,phonenumber,email);
	 },

	 editContactToList : function (id,name, phonenumber, email){
			PERSIST.updateContact(id,name,phonenumber,email);
	 },
	 
	 getSearchedList : function(){
			var searchValue = $("#search")[0].value;
			PERSIST.getSearchedContacts(searchValue);
	 },
	 
	 renderTable : function () {
		for(var id in CONTACTS.contactsObject){
			VIEW.createNewRow(id, CONTACTS.contactsObject[id].contact_name,CONTACTS.contactsObject[id].contact_phone,CONTACTS.contactsObject[id].contact_email);
		}
	},
	
	reRenderTable : function (){
		this.clearTable();
		this.renderTable();
	},
	
	 clearTable : function(){
		$("#tableBody > tr").remove();
	},
	
	 editingContact : function(){
		var id = $("#editContact").attr( "Contact_id" );
		var name = $("#firstname")[0].value;
		var phonenumber = $("#phoneNumber")[0].value;
		var email = $("#email")[0].value;
		VIEW.editContactToList(id,name,phonenumber,email);
		this.hideAddorEditDiv();
		this.clearerror();
	},
	
	 addingContact: function(){
		var name = $("#firstname")[0].value;
		var phonenumber = $("#phoneNumber")[0].value;
		var email = $("#email")[0].value;
		VIEW.addContactToList(name,phonenumber,email);
		this.clearerror();
	},
	
	doDeleteContact: function(id){
		if(confirm("Are you sure you want to delete?"))
		{	
			PERSIST.deleteContacts(id);
		}
	},
	
	populateDetailviewforEdit : function(id){
		var contact = CONTACTS.get(id);
		$("#firstname")[0].value = contact.contact_name;
		$("#phoneNumber")[0].value = contact.contact_phone;
		$("#email")[0].value = contact.contact_email;
	},
	
	doEditContact : function(id){
		this.showAddorEditDiv();
		$("#addContact").hide();
		$("#editContact").show();
		this.populateDetailviewforEdit(id);
		$("#editContact").attr({
			"Contact_id" : id
		});
	},
	
	 doAddContact : function(){
		this.showAddorEditDiv();
		$("#addContact").show();
		$("#editContact").hide();	
	},
	 showAddorEditDiv : function(){
		this.clearContact();
		$("#addoredit").slideDown();
		$("#addContacts").hide();
	},
	
	 hideAddorEditDiv: function(){
		$("#addoredit").hide();
		$("#addContacts").show();
	},
	
	 clearContact: function(){	
		$("#email")[0].value="";
		$("#firstname")[0].value="";
		$("#phoneNumber")[0].value="";
		this.clearerror();
	},
	
	clearerror: function(){
		$("#errorfirstname").text("");
		$("#errorphoneNumber").text("");
		$("#erroremail").text("");
		$("#firstname").removeClass(" errorInput");
		$("#phoneNumber").removeClass(" errorInput");
		$("#email").removeClass(" errorInput");
	},

	cancelAddorEdit: function(){
		this.clearContact();
		this.hideAddorEditDiv();
	},
	 createNewRow : function(id,namehere,phonehere,emailhere ){
		var tr_var ="<tr id=\"record_"+id+"\"><td>"+namehere+"</td><td>"+phonehere+"</td><td>"+emailhere+"</td><td><button id=\"editContact\" class=\"btn btn-warning\" onclick=\"VIEW.doEditContact("+id+")\">EDIT</button><button id=\"deleteContact\" class=\"btn btn-danger\" onclick=\"VIEW.doDeleteContact("+id+")\">DELETE</button></td></tr>";
		 $(tr_var).appendTo('#tableBody');
	},
	
	displayError : function(displayError){
		var displayErrorObj= JSON.parse(displayError);
		if ( displayErrorObj.hasOwnProperty('contact_name')){
				$("#errorfirstname").text(displayErrorObj.contact_name);
				$("#firstname").addClass(" errorInput");
		} else if(displayErrorObj.hasOwnProperty('contact_phone')){
				$("#errorphoneNumber").text(displayErrorObj.contact_phone);
				$("#phoneNumber").addClass(" errorInput");
		}else if(displayErrorObj.hasOwnProperty('contact_email')){
				$("#erroremail").text(displayErrorObj.contact_email);
				$("#email").addClass(" errorInput");
		}
	 }
};

$( document ).ready(function() {
  		VIEW.getContactlist();
});

