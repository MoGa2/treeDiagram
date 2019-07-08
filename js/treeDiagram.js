define(["UTILS/utils_reflection", "UTILS/utils_date" ], function( Utils_reflection, utils_date ){

	class TreeDiagram 
	{ 
		static Classify = function( arrayToClassify,  categories_infos )
		{
			return new TreeDiagram
			( 
				arrayToClassify, 
				{isRoot : true}, 
				{ group_maker:null }, 
				...categories_infos 
			)
		}

		constructor( itemsArrayInput, meta, props, ...categories_infos ) 
		{
			this.meta 					= meta 	|| {};
			this.props 					= props || {};

			this.categoriesOutput 		= {};
			this.itemsArrayInput 		= itemsArrayInput;

			this.meta.input 			= this.meta.input  || 	{};
			this.meta.output 			= this.meta.output ||	{};

			if ( this.meta.isRoot )
			{
				this.LEVELS = 
				{ 
					lastLevel:categories_infos[0].property, 
					allLevels:{}, 
					allLabels:{}, 
					property: categories_infos[0].property 
				};
				
				this.meta.firstLevel = this;
				this.meta.input.nbrItemsInput = this.itemsArrayInput.length;
			}

			categories_infos.forEach( function( infos )
			{
				if ( infos.interval )
				{
					infos.labelMaker = intervalMaker( infos.interval );
				};
			});

			if ( categories_infos.length > 0 )
			{
				this.ClassifyRoot( categories_infos[0] );

				if ( categories_infos.length > 1 )
				{
					categories_infos.forEach
					(
						( prop,index )=> index && this.ClassifyChild( prop )
					)

					setPercentLEVELS.call( this );
					
				}
			}
		}

		ClassifyRoot( category_infos )
		{
			addLEVELS.call( this, category_infos.property );
			this.Classify( category_infos );
			convertLEVELS.call( this, category_infos.property );
		//	addToAllLabels.call( this, category_infos.property );

			if ( this.props.cantSetPercent )
				return;


			setPercent( this, this.getTotalItems() );
		}

		Classify( category_infos )
		{
			this.property = category_infos.property;
			this.category_infos = category_infos;
			this.categoriesOutput = {};

			Object.keys( this.itemsArrayInput ).forEach
			( 
				( index )=> this.classifyOneItem( this.itemsArrayInput[ index ] )
			);

			setMeta.call( this );
		}

		classifyOneItem( item )
		{
			var propertyValue 	= getValue( item, this.category_infos ),
			label = getLabel( item, propertyValue, this.category_infos );
						

			if ( !this.categoriesOutput[ label ] )
			{
				createChildCategory.bind( this )( label, propertyValue );
			}

			this.categoriesOutput[ label ].itemsArrayInput.push( item );
			setValue.bind(this)( label, propertyValue );
		}

		ClassifyChild( category_infos )
		{ 		
			var leafs = this.getLastLeafs();
			var property = category_infos.property;

			addLEVELS.call( this, property );
			this.LEVELS.lastLevel = property;

			Object.keys( leafs ).forEach
			( 
				( index )=> leafs[ index ].Classify( category_infos )
			);

			convertLEVELS.call( this, property );
			setPercent( this.LEVELS.allLevels[ property ], this.getTotalItems()  );
		//	addToAllLabels.call( this, property );

		};

		getNumberItems()
		{
			return this.meta.input.nbrItemsInput;
		}

		getTotalItems()
		{
			return this.meta.firstLevel.itemsArrayInput.length;
		}

		getLabels()
		{
			return this.meta.output.outputLabels;
		}

		getLeaf( path )
		{
			var labels = path.split(".");
			var leaf = this;
			while ( labels.length > 0 )
			{
				let label = labels.shift();
				leaf = leaf.categoriesOutput[label];
			}

			return leaf;
		}


		getOverallPercent( path )
		{
			var leaf = ( path )? this.getLeaf( path ) : this ;

			return leaf.meta.input.overallPercent;
		}

		getPeersPercent( path )
		{
			var leaf = ( path )? this.getLeaf( path ) : this ;

			return leaf.meta.input.peersPercent;
		}

		getSameValuePercent( path )
		{
			var leaf = ( path )? this.getLeaf( path ) : this ;

			return leaf.meta.input.sameCategoryPercent;
		}

		getLeafs( property )
		{
			return this.LEVELS.allLevels[ property ].itemsArrayInput;
		}

		getLeafsByLabel( property, label )
		{
			return this.LEVELS.allLevels[ property ].categoriesOutput[ label ].itemsArrayInput;
		}

		getItemsByLabel( property, label )
		{
			let leafs = this.getLeafsByLabel( property, label ),
			items = [];
			leafs.forEach( (l)=> items = items.concat(l.itemsArrayInput));

			return items;
		}

		getLastLeafs()
		{
			return this.LEVELS.allLevels[ this.LEVELS.lastLevel ].itemsArrayInput;
		}

		getAllLabels( property )
		{
			return this.meta.firstLevel.LEVELS.allLabels[ property ];
		}

		setAllLabels()
		{
			var firstLevel = this.itemsArrayInput[0].meta.firstLevel;
			var property = this.itemsArrayInput[0].meta.input.classifiedBy;

			if ( !firstLevel.LEVELS.allLabels[ property ] )
			{
				firstLevel.LEVELS.allLabels[ property ] = {};
			}

			firstLevel.LEVELS.allLabels[ property ][ this.meta.input.label ] 
				= 
				{
					total : this.meta.input.cumuled,
					percent : this.meta.input.overallPercent
				};
		}
	}


	setPercentLEVELS = function()
	{
		Object.keys( this.LEVELS.allLevels ).forEach
		( 
			( index )=> setPercent( this.LEVELS.allLevels[ index ], this.getTotalItems()  )
		);
	}

	addLEVELS = function( property )
	{
		if ( this.props.noRecursif )
			return;

		if ( !this.meta.firstLevel.LEVELS.allLevels[ property ])
			this.meta.firstLevel.LEVELS.allLevels[ property ] = [];
		
	}

	convertLEVELS = function( property )
	{
		if ( this.props.noRecursif )
			return;

		categoriesArray =  	this.meta.firstLevel.LEVELS.allLevels[ property ];
		categoriesArray = 	new TreeDiagram( 
									categoriesArray,
									{
										isRoot:true, 
										input :{ inputsAreCategory:true }
									},
									{
										cantSetPercent:true, 
										noRecursif:true
									}, 
									{
										property : "meta.input.label"
									});

		this.meta.firstLevel.LEVELS.allLevels[ property ] = categoriesArray;
		
	}
/*
	addToAllLabels = function( property )
	{
		if ( true || this.props.noRecursif )
			return;

		this.meta.firstLevel.LEVELS.allLabels[ property ] 
		=
		this.meta.firstLevel.LEVELS.allLevels[ property ].meta.output.outputLabels;
	}
*/
	setMeta = function()
	{
		setNbrCategoriesOutput.call( this );
		setOutputLabels.call( this );

		if ( !this.meta.isRoot )
			setPercent( this, this.getTotalItems() );
	}

	setNbrCategoriesOutput = function()
	{
		this.meta.output.nbrCategoriesOutput = Object.keys( this.categoriesOutput ).length;
	}

	setOutputLabels = function()
	{
		this.meta.output.outputLabels = Object.keys( this.categoriesOutput );
	}

	setPercent = function( category, total )
	{
		let cats = category.categoriesOutput;
		
		Object.keys( cats ).forEach ( function ( c )
		{
			let cat = cats[ c ]; 


			cat.meta.input.nbrItemsInput 			= 	cat.itemsArrayInput.length;
			cat.meta.output.nbrCategoriesOutput 	= 	Object.keys( cat.categoriesOutput ).length;

			if ( cat.meta.input.inputsAreCategory )
			{
				cat.meta.input.cumuled 			= 	getCumuledItems ( cat.itemsArrayInput );
				cat.meta.input.overallPercent 	=  	getPercent( total, cat.meta.input.cumuled );
				Object.keys( cat.itemsArrayInput ).forEach( function ( index )
				{
					cat.itemsArrayInput[index].meta.input.sameCategoryPercent = 	getPercent( cat.meta.input.cumuled, cat.itemsArrayInput[index].meta.input.nbrItemsInput );
				});

				cat.setAllLabels();
			}
			else
			{
				cat.meta.input.overallPercent =  	getPercent( total, cat.meta.input.nbrItemsInput );
				cat.meta.input.peersPercent 	=	getPercent( cat.meta.parentClass.meta.input.nbrItemsInput, cat.meta.input.nbrItemsInput );

			}

		});
	}



	getCumuledItems = function( category )
	{
		return category.reduce
		( 
			(accumulator, currentValue) =>	accumulator + currentValue.meta.input.nbrItemsInput
		, 0)
	}

	getLevelCategory = function( property )
	{
		return this.meta.firstLevel.meta.allLevels[ property ];
	}

	getLevelCategoryWithValue = function( property, value )
	{
		return getLevelCategory( property )[ value ];
	}

	getPercent = function( total, partiel )
	{
		return partiel / total *100;
	}

	foreachInput = function( payload )
	{
		this.itemsArrayInput.forEach( payload );
	}



	setValue = function( label, propertyValue )
	{
		if ( typeof( this.categoriesOutput[ label ].propertyValue ) == "object" )
		{
			this.categoriesOutput[ label ].propertyValue[ propertyValue ] = 1;
		}
		else if ( this.categoriesOutput[ label ].propertyValue && this.categoriesOutput[ label ].propertyValue != propertyValue )
		{
			var temp = {};
			temp [ this.categoriesOutput[ label ].propertyValue ] = 1;
			this.categoriesOutput[ label ].propertyValue = temp;
			this.categoriesOutput[ label ].propertyValue[ propertyValue ] = 1;
		}
		else
		{
			this.categoriesOutput[ label ].propertyValue = propertyValue;
		}
	}

	createChildCategory = function( label, propertyValue )
	{
		var meta = 
		{
			parentClass  		: this,
			firstLevel	 		: ( this.meta.isRoot )? this : this.meta.firstLevel,

			output 				: { OutputClassifiedBy 	: this.category_infos.property },
			input				: 
			{ 
				inputsAreCategory	: this.meta.input.inputsAreCategory || false, 
				value : propertyValue,
				label : label,
				classifiedBy : this.category_infos.property
			}
			
		};

		var currentCategorie = new TreeDiagram( new Array(), meta, null);
		registerCategory( currentCategorie, this.meta.firstLevel, this.category_infos.property );
		this.categoriesOutput[ label ] 			= currentCategorie;
	}

	getLabel = function( item, value, category_infos )
	{
		var label;
		if ( category_infos.labelMaker )
		{
			label = category_infos.labelMaker( value, item, category_infos.property );
		}
		else
		{
			label = value;
		}
		return label;
	}

	getValue = function( obj, category_infos )
	{
		var val;
		if ( typeof ( category_infos.property ) == "function" ) 
		{ 
			val = category_infos.propertie( obj );
		}
		else
		{
			val = Utils_reflection.GetField( obj, category_infos.property );
		}
		return val;
	}

	registerCategory = function( category, firstLevel, property )
	{
		if ( !firstLevel.LEVELS.allLevels[ property ] )
		{
			firstLevel.LEVELS.allLevels[ property ] = [];
		}
			firstLevel.LEVELS.allLevels[ property ].push( category );
	}	


	intervalMaker = function( interval, first_interval_is_close )
	{
		return function( val )
		{
			if ( interval == 0 )
				return "unique";
			if ( interval == 1 )
				return val;
				
			if ( val > interval )
			{
				var n = val / interval,
				floored_n = Math.floor( n ),
				is_on_limit = Number.isInteger( n ),
				first, end;

				// ] first - end ]
				if ( is_on_limit && first_interval_is_close )
				{
					first = interval * ( floored_n - 1 );
					end = floored_n * interval;
					return "]" + first + "-"+ end +"]";
				}
				// [ fisrt - end [
				else
				{
					first = floored_n * interval;
					end = interval * ( floored_n + 1 );
					return "[" + first + "-"+ end +"["
				}

			}
			else
			{
				return "[0-"+ interval +"]"
			}
		};
	}


	return TreeDiagram;
});