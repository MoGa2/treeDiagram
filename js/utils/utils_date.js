define( function( ){
	var Utils_date  = (function ( ) 
	{	
	});
	

	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	Utils_date.getMonths = function()
	{
		return months;
	}

	var time_groups_names = ["year", "month", "week", "day", "cday", "hour", "minute", "seconde"]

	Utils_date.getTimeGroupNames = function()
	{
		return time_groups_names;
	}
	
	var time_groups_names_minus_cday = ["year", "month", "week", "day", "hour", "minute", "seconde"]

	Utils_date.getTimeGroupNamesMinusCday = function()
	{
		return time_groups_names_minus_cday;
	}

	Utils_date.getMonthNumber = function( month_name )
	{
		return months.indexOf( month_name );
	}
	
	Utils_date.getMonthName = function( month_nbr )
	{
		return months[ month_nbr ];
	}

	var days = "Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(" ");

	Utils_date.getDayName = function( day_nbr )
	{
		return days[ day_nbr ];
	}

	Utils_date.getDateOfISOWeek = function(w, y)
	{
	    var simple = new Date(y, 0, 1 + (w - 1) * 7);
	    var dow = simple.getDay();
	    var ISOweekStart = simple;
	    if (dow <= 4)
	        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
	    else
	        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
	    return ISOweekStart;
	}

	return Utils_date ;
});