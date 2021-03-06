//
// ink - okami parser
//
// tokenizer module
//
// this module breaks the source code into tokens
//
var tokenizer = function() {
	
	// public
	var pub = {}
		
	
	pub.tokenize = function( par_tree ) {
		
		//lines = par_lines
		tree = par_tree
		
		var flat = tree.flat()
		
		// call break_tokens on each tree node
		//tree.walk( break_tokens )
		for(var i=0; i<flat.length; i++ ) {

			break_tokens( flat[i] )
		}
		

		return( tree )
	}
	
	
	
	// regexs
	var rgx_tokens = /^\t+|one|two|three|four|five|six|!|\.|\(|\)/g
	var rgx_invalid_spacing = /[^\s\n]/
	var rgx_valid_ending = /^\s*(\:\:.*)?$/

	
	// source lines list
	//var lines = null
	var tree
	
	
	
	
	
	// check if a line can be ignored
	var is_not_code = function( line ) {
		
		if( rgx_valid_ending.test( line ) ) 
			return true
		else 
			return false
	}
	
	
	
	
	//
	var break_tokens = function( node ) {
		
		var match, from, to, continue_searching
		

		// get data from tree node
		var o_line = node.item
		

		var source = o_line.source.code
		var line_number = o_line.number
		
		// ignore empty or comment lines
		if( is_not_code( source ) )
			node.rip() 
	
				
		from = 0
		continue_searching = true
		while( continue_searching ) {
			
			match = rgx_tokens.exec( source )
			
			
			// if token found
			if( match ) {
				
				to = match.index

				// check filling space for invalid syntax.
				// between previous point, and current token match
				// position, or end of line
				check_spacing( from, to, source, line_number, node )
								
				// add token to tree
				add_token( node, match[0], line_number, from, to )
				
				// update from
				from = rgx_tokens.lastIndex
				
			} else {
				// check remaining of source code 
				// for invalid syntax
				check_rest( source, line_number, from, node )
				
				// search of this line is completed
				continue_searching = false
			}


		}
		
	}	
	
	
	
	// add token
	var add_token = function( node, token_string, line_number, from, to ) {
		
		var bit = o_bit.new()
		
		// if the token is tabs at start of line
		if( token_string.substring(0,1) == '\t' ) {	
			// process any number of tabs
			for(var i=0; i<token_string.length; i++ )
				add_token( node, 'tab', line_number, i, i )
			return
		}
			
		bit.bit = token_string
				
		// data for original position in source code
		bit.source.line = line_number
		bit.source.from = from
		bit.source.to = to 
		
		var bit_node = blue.tree.node( bit )
		
		node.sub.add( bit_node )
	}
	
		

	// check spacing characters between tokens, for
	// invalid syntax
	//
	//var check_spacing = function( match, from, line, line_number ) {
	var check_spacing = function( from, to, line, line_number, node ) {	
		// check spacing for invalid syntax
		// between previous position and token found
		var spacing = line.substring( from, to )

		// test for invalid spacing syntax
		if( rgx_invalid_spacing.test( spacing ) ) {
			// invalid syntax found
			//console.log( 'invalid syntax at line: ' + line_number )
			//console.log( 'syntax: ' + spacing )
			
			//insert error node
			var bit = o_bit.new()
			bit.type = "error"
			bit.source.line = line_number
			bit.source.from = from
			bit.source.to = to
			bit.bit = spacing
			
			node.sub.add( blue.tree.node( bit ) )
		}		
		
	}
	


	// check the ending part of the line
	// for valid syntax
	var check_rest = function( source, line_number, from, node ) {
		
		var rest

		rest = source.substring( from )
		
		
		// return if valid line ending
		if( rgx_valid_ending.test( rest ) ) 
			return
		
		// else error
		//console.log( 'invalid syntax at line: ' + line_number )
		//console.log( 'syntax: ' + rest )	
		
		//insert error node
		var bit = o_bit.new()
		bit.type = "error"
		bit.source.line = line_number
		bit.source.from = from
		bit.source.to = source.length - 1
		bit.bit = rest
		
		node.sub.add( blue.tree.node( bit ) )
		
	}


		
	return pub
	
}()


