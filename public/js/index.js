let urlBase = "/blog-posts";
let blogList = [];

// Loading the existing posts
function loadPosts() {
    $("#blogList > li").remove();
    $.ajax({
        url: urlBase,
        method: "GET",
        dataType: "json",
        success: function(response) {
            blogList = [];
            response.map(post => blogList.push(post));
        },
        error: function(error) {
            console.log(error);
        }
    }).done(function() {
        blogList.forEach(post => {
            let title = $(`<h3> ${post.title} </h3>`);
            let author = $(`<p> By ${post.author} <p>`);
            let parsedDate = new Date(Date.parse(post.publishDate));
            let date = $(`<p> Posted: ${parsedDate} <p>`);
            let content = $(`<p> ${post.content} </p>`);
            let id = $(`<p> Entry: ${post.id} </p>`);
            let p = $("<li>").append(title, author, date, id, content);
            $("#blogList").append(p);
        })
    });
}

$("#newPostButton").click(function(){
    let title = $("#postTitle").val();
    let content = $("#postContent").val();
    let author = $("#postAuthor").val();
    let date = new Date();
    let obj = {
        title: title,
        content: content,
        author: author,
        publishDate: date
    };

    $.ajax({
        url: urlBase,
        data: JSON.stringify(obj),
        method: "POST",
        contentType: "application/json",
        success: function() {
            loadPosts();
            cleanForm();
        },
        error: function(err) {
            alert(err.statusText);
        }
    });
});

$("#deletePostButton").click(function(){
    let id = $("#postIDelete").val().trim();
    if(!id) {
        alert("No ID provided");
        return;
    }

    let body = {
        id: id
    };

    $.ajax({
        url: urlBase + '/' + id,
        method: "DELETE",
        data: JSON.stringify(body),
        contentType: "application/json",
        success: function() {
            loadPosts();
            cleanForm();
        },
        error: function(err) {
            alert(err.statusText);
        }
    });
});

$("#updateButton").click(function(){
    let idU = $("#postIDU").val().trim();
    if(!idU) {
        alert("No ID provided");
        return;
    }

    let title = $("#postTitleU").val();
    let content = $("#postContentU").val();
    let author = $("#postAuthorU").val();
    let date = new Date();
    let body = $.extend({}, {
        id: idU,
        title: title != "" ? title : undefined,
        content: content != "" ? content : undefined,
        author: author != "" ? author : undefined,
        publishDate: date
    });

    $.ajax({
        url: urlBase + '/' + idU,
        method: "PUT",
        data: JSON.stringify(body),
        contentType: "application/json",
        success: function() {
            loadPosts();
            alert("Succesful update");
            cleanForm();
        },
        error: function(err) {
            alert(err.statusText);
        }
    });
});

function cleanForm() {
    $("input[type=text]").val("");
    $("textarea").val("");
}

loadPosts();
