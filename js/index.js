var domain = "https://nodepad.larry.cf"
$.get(domain + "/", function(res) {
  if (res.error == "none" && res.status == "online") {
    $(".spinner").remove()
    $("body").animate({
      "background-color": "rgb(52, 55, 63)"
    }, 700)
    $("form").fadeIn(700)
  } else {
    window.location.href = "/maintenance"
  }
}).fail(function() {
  window.location.href = "/maintenance"
});

function getUTF8Length(s) {
  var len = 0;
  for (var i = 0; i < s.length; i++) {
    var code = s.charCodeAt(i);
    if (code <= 0x7f) {
      len += 1;
    } else if (code <= 0x7ff) {
      len += 2;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      len += 4;
      i++;
    } else if (code < 0xffff) {
      len += 3;
    } else {
      len += 4;
    }
  }
  return len;
}

function getType(content) {
  return "other"
}

function validateNote() {
  var name = $("#name").val()
  var body = $("#content").val()
  if (/^[a-z0-9]+$/i.test(name)) {
    if (getUTF8Length(btoa(body)) < 10240) {
      createNote()
    } else {
      swal("Sorry", "You entered text that is too long!", "error")
    }
  } else {
    swal("Oops.", "Your note name can only contain alphanumeric characters!", "error")
  }
}

function createNote() {
  var name = $("#name").val()
  var body = btoa($("#content").val())
  var type = getType(body)
  var final = {
    name: name,
    type: type,
    body: body
  }
  $.ajax({
    url: domain + "/create",
    type: "post",
    dataType: "json",
    timeout: "1000",
    contentType: "application/json",
    data: JSON.stringify(final),
    complete: function(data, status) {
      var res = data.responseJSON
      if (status == "success") {
        if (res.error == "none") {
          window.location.href="/note/#" +name
        } else {
          swal("Error!", res.error, "error")
        }
      } else {
        swal("Oh no!", "There was a problem while sending your request! The server may be down.", "error")
      }
    }
  })
}
function showinfo() {
  swal("", "Transferpad allows you to transfer text from any device to any other device on the internet. The name of your note suffixes the url. Try it for yourself! <b style='font-weight: 400'>All notes are deleted after 15 minutes of creation.</b>")
}
