var domain = "https://nodepad.larry.cf"
$.get(domain + "/", function(res) {
  if (res.error == "none" && res.status == "online") {
    $(".spinner").remove()
    $("body").animate({
      "background-color": "rgb(52, 55, 63)"
    }, 700)
    if (location.hash !== "") {
      var note = location.hash.replace("#", "")
      $.get(domain + "/get/" + note, function(res) {
        if (res.error == "none") {
           $("form").fadeIn(700)
            $("#name").val(note)
          $("#content").html(filterXSS(decodeURIComponent(atob(res.note))))
        } else {
          swal("Oops", res.error, "error").then(function() {
            window.location.href = "/"
          })
        }
      })
    } else {
          swal("Oops", "You did not enter a note name!", "error").then(function() {
            window.location.href = "/"
          })
    }

  } else {
    window.location.href = "/maintenance"
  }
}).fail(function() {
  window.location.href = "/maintenance"
});
function showinfo() {
  swal("", "Transferpad allows you to transfer text from any device to any other device on the internet. The name of your note suffixes the url. Try it for yourself! <b style='font-weight: 400'>All notes are deleted after 15 minutes of creation.</b>")
}
