var srchr = {
  tools: [
    {
      name: 'yahoo',
      table: 'search.web(10)',
      where: 'query="#{query}"'
    }, {
      name: 'flickr',
      table: 'flickr.photos.search(10)',
      where: 'text="#{query}" AND has_geo="true"'
    }, {
      name: 'upcoming',
      table: 'upcoming.events(5)',
      where: 'tags="#{query}" or description LIKE "%#{query}%" OR name LIKE "%#{query}%"'
    }
  ],
  srchs: [],
  updateSearchTerms: function() {
    var terms = $("#search_terms ul");
    terms.empty();
    $.each(
      srchr.srchs,
      function(idx, i) {
	var services = [];
	if (i.flickr) {
	  services.push('f');
	}
	if (i.yahoo) {
	  services.push('y');
	}
	if (i.upcoming) {
	  services.push('u');
	}
	var el = $('<li><a href="#">'+i.term+'</a> ('
		   + services.join(',')
		   +') <a href="#" class="remove">x<a/></li>');
	el.find('a:first').click(srchr.reloadSearch);
	el.find('a.remove').click(srchr.removeTerm);
	el.appendTo(terms);
      }
    );
  },
  reloadSearch: function(ev) {
    ev.preventDefault();
    var el = $(ev.currentTarget);
    var term = el.find('a:first').text();
    $.each(
      srchr.srchs,
      function(idx, i) {
	if (i.term == term) {
	  $('input#search').val(term);
	  $('.controls input').removeAttr('checked');
	  for (var s in i) {
	    var service = $('input#'+s);
	    if (service){
	      service.attr('checked','checked');
	    }
	  }
	}
      }
    );
    submit_query();
  },
  removeTerm: function(ev) {
    ev.preventDefault();
    var el = $(ev.currentTarget).parent();
    var term = el.find('a:first').text();
    $.each(
      srchr.srchs,
      function(idx, i) {
	if (i.term == term) {
	  srchr.srchs = srchr.srchs.splice(0,idx).concat(srchr.srchs.splice(idx+1, srchr.srchs.length));
	  return;
	}
      }
    );
    srchr.updateSearchTerms();
  },
  updateSearchResults: function(results) {
    for (var method in results){
      if (results[method]) this.results_functions[method](results);
    }
  },
  results_functions: {
    'yahoo': function(results) {
      var section = $("#web_results");
      var web_results = $("#web_results ul");

      var webs = results['yahoo'].result;
      if (!(webs instanceof Array)) {
	webs = [webs];
      }

      web_results.empty();
      web_results.append(
	$.map(webs,
	      function(i) {
		return '<li>'
		  + '<a href="'+i.url+'">'+i.title+'</a>'
		  + '<p>'+i['abstract']+'</p>'
		  + '</li>';
	      }
	     ).join("")
      );
      section.css({display:"block"});
    },
    'flickr': function(results) {
      var section = $("#flickr_results");
      var flickr_results = $("#flickr_results ul");

      var photos = results['flickr'].photo;
      if (!(photos instanceof Array)) {
	photos = [photos];
      }

      flickr_results.empty();
      flickr_results.append(
	$.map(photos,
	      function(i) {
		return '<li>'
		  + '<a href="http://www.flickr.com/photos/'+i.owner+'/'+i.id+'/">'
		  + '<img src="http://farm'+i.farm+'.static.flickr.com/'+i.server+'/'+i.id+'_'+i.secret+'_s.jpg" alt="'+i.title+'" />'
		  + '</a>'
		  + '</li>';
	      }
	     ).join("")
      );
      section.css({display:"block"});
      $('.side_dishes').css({display:'block'});
    },
    'upcoming': function(results) {
      var section = $("#upcoming_results");
      var upcoming_results = $("#upcoming_results ul");

      var events = results['upcoming'].event;
      if (!(events instanceof Array)) {
	events = [events];
      }

      upcoming_results.empty();
      upcoming_results.append(
	$.map(events,
	      function(i) {
		return '<li>'
		  + '<img src="'+i.photo_url+'" alt="'+i.venue_name+'" />'
		  + '<h4><a href="'+i.url+'"'+i.title+'</h4>'
		  + '<span>'+i.start_date+'</span>'
		  + '<a href="'+i.ticket_url+'">Rock A Ticket</a>'
		  + '</li>';
	      }
	     ).join("")
      );
      section.css({display:"block"});
      $('.side_dishes').css({display:'block'});
    }
  }
};

$(document).ready(
  function() {
    $("#search_submit").click(submit_query);
    $("#search").keypress(
      function(event) {
	if (event.keyCode == '13') {
	  event.preventDefault();
	  submit_query();
	}
      }
    );

    $('a.advanced').click(
      function(ev) {
	ev.preventDefault();
	var controls = $('.controls');
	if (controls.hasClass('hide')) {
	  controls.slideDown('slow');
	  controls.toggleClass('hide',false);
	  controls.toggleClass('show',true);
	} else {
	  controls.slideUp('slow');
	  controls.toggleClass('hide',true);
	  controls.toggleClass('show',false);
	}
      }
    );
  }
);

function submit_query() {
  var query = $("#search").val();
  var term = {
    term: query
  };
  var selected_tools = [];
  $(".controls input").each(
    function(idx, item) {
      if ($(item).attr('checked')) {
	var service = $(item).attr('name');
	selected_tools.push(service);
	term[service] = true;
      }
    }
  );
  srchr.srchs.unshift(term);
  $.each(srchr.tools,
	 function(idx, tool) {
	   var section = $("#"+tool.name+"_results");
	   section.css({display:'none'});
	   $.yql(
	     "SELECT * FROM "+tool.table+" WHERE "+tool.where,
	     {
	       query: query
	     },
	     function (data) {
	       if (!(data.error)) {
		 var results = {};
		 results[tool.name] = data.query.results;
		 srchr.updateSearchResults(results);
	       }
	     }
	   );
	 }
	);

  srchr.updateSearchTerms();
}