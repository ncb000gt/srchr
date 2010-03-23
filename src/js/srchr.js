var srchr = {
  srchs: [],
  updateSearchTerms: function() {
    var terms = $("#search_terms");
    terms.empty();
    terms.append(
      srchr.srchs.map(
	function(i) {
	  return "<li>"+i+"</li>";
	}
      ).join("")
    );
  },
  updateSearchResults: function(results) {
    if ('web' in results) {
      var web_results = $("#web_results");
      web_results.empty();
      web_results.append(
	$.map(results['web'],
	      function(i) {
		return '<li>'
		  + '<a href="'+i.url+'">'+i.title+'</a>'
		  + '<p>'+i['abstract']+'</p>'
		  + '</li>';
	      }
	     ).join("")
      );
    }

    if ('flickr' in results) {
      var flickr_results = $("#flickr_results");
      flickr_results.empty();
      flickr_results.append(
	$.map(results['flickr'],
	      function(i) {
		return '<li>'
		  + '<a href="http://www.flickr.com/photos/'+i.owner+'/'+i.id+'/">'
		  + '<img src="http://farm'+i.farm+'.static.flickr.com/'+i.server+'/'+i.id+'_'+i.secret+'_s.jpg" alt="'+i.title+'" />'
		  + '</a>'
		  + '</li>';
	      }
	     ).join("")
      );
    }
  }
};

$(document).ready(
  function() {
    $("#search_submit").click(
      function() {
	var query = $("#search").val();
	srchr.srchs.unshift(query);

	$.yql(
	  "SELECT * FROM search.web WHERE query='#{query}'",
	  {
	    query: query
	  },
	  function (data) {
	    console.log(data);
	    if (!(data.error)) {
	      srchr.updateSearchResults(
		{
		  'web': data.query.results.result
		}
	      );
	    }
	  }
	);

	$.yql(
	  "SELECT * FROM flickr.photos.search WHERE text='#{query}' and has_geo='true'",
	  {
	    query: query
	  },
	  function (data) {
	    console.log(data);
	    if (!(data.error)) {
	      srchr.updateSearchResults(
		{
		  'flickr': data.query.results.photo
		}
	      );
	    }
	  }
	);

	srchr.updateSearchTerms();
      }
    );
  }
);