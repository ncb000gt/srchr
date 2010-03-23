var srchr = {
  srchs: []
};

$(document).ready(
  function() {
    alert('Lets start this piece.');


    $("#search_submit").click(
      function() {
	var query = $("#search").val();
	$.yql(
	  "SELECT * FROM search.web WHERE query='#{query}'",
	  {
	    query: query
	  },
	  function (data) {
	    console.log(data);
	  }
	);
      }
    );
  }
);