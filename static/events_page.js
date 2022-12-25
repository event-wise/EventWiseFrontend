var items;
var token = "123";

window.addEventListener('load', function () {
    if(this.document.getElementById("dont") == null){
        getData();
    }
});
async function getData() {
    
    const res1 = await fetch("/authToken")

    token = await res1.json();

    const res2 = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/get-all-events", 
    {headers: { Authorization: token}})
    items = await res2.json();
    listEvents();
}




function listEvents(){
    
    if (document.getElementById("events_table") == null) {
        var div = document.createElement("div");
        div.setAttribute("class", "table_wrap");
        var table = document.createElement("TABLE");
        table.setAttribute("class", "table is-bordered is-fullwidth");
        table.setAttribute("id", "events_table");
        document.body.appendChild(div);
        div.appendChild(table);
    }
    else {
        var table = document.getElementById("events_table");
        while (table.hasChildNodes()) {
            table.removeChild(table.firstChild);
        }
    }
    var row_header = document.createElement("TR");

    var eventnameH = document.createElement("TH");
    var groupnameH = document.createElement("TH");
    var createEvent = document.createElement("TH");
    var searchEvent = document.createElement("TH");

    var createB = document.createElement("button");
    createB.setAttribute("class", "button is-rounded is-link");
    createB.setAttribute("type", "create");
    createB.setAttribute("id", "create_event");
    createB.innerText = "Add Event";
    createB.addEventListener("click",addEvent)

    var searchBar = document.createElement("INPUT");
    searchBar.setAttribute("class", "input");
    searchBar.setAttribute("type", "text");
    searchBar.setAttribute("id", "searchBar");
    searchBar.setAttribute("value", "");
    searchBar.addEventListener("input",displayEvents)

    row_header.appendChild(eventnameH);
    row_header.appendChild(groupnameH);
    row_header.appendChild(createEvent);
    row_header.appendChild(searchEvent)

    createEvent.appendChild(createB);
    eventnameH.appendChild(document.createTextNode("Eventname"));
    groupnameH.appendChild(document.createTextNode("Groupname"));
    searchEvent.appendChild(searchBar)

    table.appendChild(row_header);
    function displayEvents(){
        while(table.childNodes.length>1){
            table.removeChild(table.lastChild)
        }
        if (items) {

            for (const x in items) {
                
                var item = items[x];
                if(searchBar.value=="" || item["eventName"].includes(searchBar.value)){
                
                    var row = document.createElement("TR");

                    var eventnameCell = document.createElement("TD");
                    var groupnameCell = document.createElement("TD");
                    var updateButton = document.createElement("TD");  
                    var deleteButton = document.createElement("TD");

                    row.appendChild(eventnameCell);
                    row.appendChild(groupnameCell);
                    row.appendChild(updateButton);     
                    row.appendChild(deleteButton);

                    var eventname = document.createTextNode(item["eventName"]);
                    var groupname = document.createTextNode(item["groupName"]);

                    var deleteB = document.createElement("button");
                    deleteB.setAttribute("class", "button is-rounded is-danger");
                    deleteB.setAttribute("type", "delete");
                    deleteB.setAttribute("id", item["eventId"]);
                    deleteB.innerText = "Delete";
                    deleteB.addEventListener("click", deleteEvent);

                    var updateB = document.createElement("button");
                    updateB.setAttribute("class", "button is-rounded is-success");
                    updateB.setAttribute("type", "update");
                    updateB.setAttribute("id", item["eventId"]);
                    updateB.innerText = "Update";
                    updateB.addEventListener("click", updateEvent);

                    eventnameCell.appendChild(eventname);
                    groupnameCell.appendChild(groupname);
                    updateButton.appendChild(updateB);
                    deleteButton.appendChild(deleteB);

                    table.appendChild(row);
                }
                }

            }
        }
        displayEvents();
        
}

async function deleteEvent(event){
    var event_id = event.target.id;
    const res = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/delete-event", 
    {method: 'POST',
    headers: { Authorization: token,"Content-Type": "application/json"},
    body: JSON.stringify({"id":event_id})
    })
    const resp = await res.json();
    console.log(resp)
    if(resp["status"]==200){
        var index = items.findIndex(o => o.eventId == event_id)
        if (index !== -1) {
            console.log(index);
            items.splice(index, 1);
        }
        alert("Succesfully deleted");
    }
    else{
        alert(resp["error"]);
    }
    listEvents();
}

function updateEvent(event){
    var event_id = event.target.id;
    var index = items.findIndex(o => o.eventId == event_id);
    var event = items[index];
    var mapForm = document.createElement("form");
    mapForm.target = "Map";
    mapForm.method = "POST";
    mapForm.action = "/update_event";

    for (key in event){
        var mapInput = document.createElement("input");
        mapInput.type = "text";
        if(["creationTime","groupName","organizerId","organizerName"].includes(key)){

        }
        else{
            mapInput.name = key;
            mapInput.value = event[key];
            mapForm.appendChild(mapInput);
        }
    }
    document.body.appendChild(mapForm);
    map = window.open("", "Map", "status=0,title=0,height=600,width=800,scrollbars=1");
if (map) {
    mapForm.submit();   
} else {
    alert('You must allow popups for this map to work.');
}
}



async function sendUpdate(form){
    const res1 = await fetch("/authToken")
    token = await res1.json();
    var formData = new FormData(form);
    body_string = {};
    for (var pair of formData.entries()) {
        body_string[pair[0]] = pair[1];
    }
    body_string["eventId"] = parseInt(body_string["eventId"]);
    body_string["groupId"] = parseInt(body_string["groupId"]);
    
    console.log(JSON.stringify(body_string));

    const req = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/update-event-details", 
    {method: 'POST',
    headers: { "Authorization": token, "Content-Type": "application/json"},
    body: JSON.stringify(body_string)
    })
    const resp = await req.json();
    if(resp["status"]==200){
        alert("Update Succesful");
        window.close();

    }
    else{
        alert("Update unsuccessful");
        console.log(resp);
    }
    

}


function addEvent(){
    
    var mapForm = document.createElement("form");
    mapForm.target = "Map1";
    mapForm.method = "POST";
    mapForm.action = "/add_event";


    document.body.appendChild(mapForm);

    map_user = window.open("", "Map1", "status=0,title=0,height=600,width=800,scrollbars=1");
    
if (map_user) {
    mapForm.submit();   
} else {
    alert('You must allow popups for this map to work.');
}
}

async function addEventInfo(form){
    const res1 = await fetch("/authToken")
    token = await res1.json();
    var formData = new FormData(form);
    body_string = {};
    for (var pair of formData.entries()) {
        body_string[pair[0]] = pair[1];
    }
    
    console.log(JSON.stringify(body_string));

    const req = await fetch("http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/admin/create-event", 
    {method: 'POST',
    headers: { "Authorization": token, "Content-Type": "application/json"},
    body: JSON.stringify(body_string)
    })
    const resp = await req.json();
    if(resp["status"]==200){
        alert("Event created succesfully");
        window.close();

    }
    else{
        alert("Event could not be created");
        console.log(resp);
    }
    

}