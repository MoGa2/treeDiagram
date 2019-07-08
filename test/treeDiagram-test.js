define(["treeDiagram"], function(TreeDiagram) {

    var fixture =
    [
        { survivor:  true,  gender:     "man",   age:    30,    class: 1}, 
        { survivor:  true,  gender:     "woman", age:    22,    class: 2}, 
        { survivor:  false, gender:     "man",   age:    50,    class: 2}, 
        { survivor:  false, gender:     "man",   age:    20,    class: 2}, 
        { survivor:  false, gender:     "woman", age:    21,    class: 3}
    ]; 

    var SurvivorGender = 
    [
        {property:"survivor"}, 
        {property:"gender"}
    ];

    describe('TreeDiagram', function() {

        it('Classify with 1 level depth', function() 
        {

            var tree = TreeDiagram.Classify( fixture, [{ property: "survivor"}] );

            expect( tree.meta.output.nbrCategoriesOutput )      .toEqual(2);
            expect( tree.meta.output.outputLabels )             .toEqual(["true", "false"]);

            expect( tree.categoriesOutput.false )               .toBeDefined();
            expect( tree.categoriesOutput.true )                .toBeDefined();

            var survived    = tree.categoriesOutput.true;
            var dead        = tree.categoriesOutput.false;

            expect( survived.meta.input.nbrItemsInput )         .toEqual(2);
            expect( dead.meta.input.nbrItemsInput )             .toEqual(3);

        });

        it('Classify with severals levels depth', function() 
        {

            var tree        = TreeDiagram.Classify( fixture, SurvivorGender );
            var survived    = tree.categoriesOutput.true;
            var dead        = tree.categoriesOutput.false;

            expect( survived.meta.output.nbrCategoriesOutput )  .toEqual(2);
            expect( dead.meta.output.nbrCategoriesOutput )      .toEqual(2);

            expect( survived.categoriesOutput.man )             .toBeDefined();
            expect( survived.categoriesOutput.woman )           .toBeDefined();
            expect( dead.categoriesOutput.man )                 .toBeDefined();
            expect( dead.categoriesOutput.woman )               .toBeDefined();

            var survivedMen  = survived.categoriesOutput.man;
            var deadMen      = dead.categoriesOutput.man;

            expect( survivedMen.meta.input.nbrItemsInput )      .toEqual(1);
            expect( deadMen.meta.input.nbrItemsInput )          .toEqual(2);

        });

//******************************************************************************************

        it('Can retrieve category using path-string ', function() 
        {

            var tree            = TreeDiagram.Classify( fixture, SurvivorGender );
            var survivedMen     = tree.getLeaf( "true.man" );

            expect( survivedMen )                               .toBeDefined();
            expect( survivedMen.meta.input.nbrItemsInput )      .toEqual(1);
        });

        it('Calcul precentage of one category against total items ', function() 
        {

            var tree            = TreeDiagram.Classify( fixture, SurvivorGender );
            var survivedMen     = tree.getLeaf( "true.man" );

            expect( survivedMen.meta.input.overallPercent )     .toEqual(20);
        });

        it('Calcul precentage of one category against same branch items', function() 
        {

            var tree            = TreeDiagram.Classify( fixture, SurvivorGender );
            var survivedMen     = tree.getLeaf( "true.man" );

            expect( survivedMen.meta.input.peersPercent )       .toEqual(50);
        });

        it('Calcul precentage of one category against same category items across all branchs ', function() 
        {

            var tree            = TreeDiagram.Classify( fixture, SurvivorGender );
            var survivedMen     = tree.getLeaf( "true.man" );

            expect( survivedMen.meta.input.sameCategoryPercent ).toEqual(33.33333333333333);
        });

        it('Can retrieve percent using path-string ', function() 
        {

            var tree            = TreeDiagram.Classify( fixture, SurvivorGender );

            expect( tree.getOverallPercent( "true.woman" ))    .toEqual(20);
            expect( tree.getPeersPercent( "true.woman" ) )     .toEqual(50);
            expect( tree.getSameValuePercent( "true.woman" ) ) .toEqual(50);
        });

//******************************************************************************************

        var labelMaker = function( v, i, p )
        { 
            if      ( v === true )  return "survived";
            else if ( v === false ) return "dead";  
            else                    return v; 
        };

        var SurvivorGenderWithLabelMaker = 
        [
            {property:"survivor" , labelMaker}, 
            {property:"gender"}
        ];

        it('Can use a function to create category label', function() 
        {
            var tree  = TreeDiagram.Classify( fixture, SurvivorGenderWithLabelMaker );

            expect( tree.categoriesOutput.dead)         .toBeDefined();
            expect( tree.categoriesOutput.survived )    .toBeDefined();
        });

        it('Can retrieve category using path-string while using labelMaker ', function() 
        {

            var tree            = TreeDiagram.Classify( fixture, SurvivorGenderWithLabelMaker );
            var survivedMen     = tree.getLeaf( "survived.man" );

            expect( survivedMen )                               .toBeDefined();
            expect( survivedMen.meta.input.nbrItemsInput )      .toEqual(1);
        });

        it('Can retrieve percent using path-string while using labelMaker', function() 
        {

            var tree = TreeDiagram.Classify( fixture, SurvivorGenderWithLabelMaker );

            expect( tree.getOverallPercent( "survived.woman" ))    .toEqual(20);
            expect( tree.getPeersPercent( "survived.woman" ) )     .toEqual(50);
            expect( tree.getSameValuePercent( "survived.woman" ) ) .toEqual(50);
        });

//******************************************************************************************
        var SurvivorGenderAgeWithInterval = 
        [
            {property:"survivor" }, 
            {property:"gender"},
            {property:"age", interval: 10},
        ];

        it('Create and use interval as label', function() 
        {
            var tree = TreeDiagram.Classify( fixture, SurvivorGenderAgeWithInterval );

            expect( tree.getLeaf( "false.man.[20-30["))                         .toBeDefined();
            expect( tree.getLeaf( "false.man.[20-30[").meta.input.nbrItemsInput).toEqual(1);

        });

        it('Calcul percentage for interval', function() 
        {
            var tree = TreeDiagram.Classify( fixture, SurvivorGenderAgeWithInterval );

            expect( tree.getOverallPercent( "false.man.[20-30["))       .toEqual(20);
            expect( tree.getPeersPercent( "false.man.[20-30[" ) )       .toEqual(50);
            expect( tree.getSameValuePercent( "false.man.[20-30[" ) )   .toEqual(33.33333333333333);
        });
       
//******************************************************************************************
        
        it('List all values of each properties and their number of occurences', function() 
        {
            var tree = TreeDiagram.Classify( fixture, SurvivorGenderAgeWithInterval );
            var allLabels = tree.getAllLabels( "gender" );

            expect( allLabels.man )                 .toBeDefined();
            expect( allLabels.woman )               .toBeDefined();
            expect( allLabels.man.total )           .toEqual( 3 );
            expect( allLabels.woman.percent )       .toEqual( 40 );
        });

        it('List all leafs from a levels', function() 
        {
            var tree = TreeDiagram.Classify( fixture, SurvivorGenderAgeWithInterval );
            var leafs = tree.getLeafs( "gender" );

            expect( leafs.length )                  .toEqual(4);
            expect( leafs[0].propertyValue )        .toEqual("man");
            expect( leafs[1].propertyValue )        .toEqual("woman");
            expect( leafs[2].propertyValue )        .toEqual("man");
            expect( leafs[3].propertyValue )        .toEqual("woman");

        });


        it('List all leafs with the same value from a levels', function() 
        {
            var tree = TreeDiagram.Classify( fixture, SurvivorGenderAgeWithInterval );
            var leafs = tree.getLeafsByLabel( "gender", "man" );

            expect( leafs.length )                  .toEqual(2);
            expect( leafs[0].propertyValue )        .toEqual("man");
            expect( leafs[1].propertyValue )        .toEqual("man");

        });

        it('List all items with the same value', function() 
        {
            var tree = TreeDiagram.Classify( fixture, SurvivorGenderAgeWithInterval );
            var leafs = tree.getItemsByLabel( "gender", "man" );

            expect( leafs.length )                  .toEqual(3);
            expect( leafs[0].gender )               .toEqual("man");
            expect( leafs[1].gender )               .toEqual("man");
            expect( leafs[2].gender )               .toEqual("man");

        });
//******************************************************************************************
        
        it('Let brows down the tree', function() 
        {
            var tree = TreeDiagram.Classify( fixture, SurvivorGenderAgeWithInterval );
            var allLabels = tree.getAllLabels( "gender" );

            expect( allLabels.man )                 .toBeDefined();
            expect( allLabels.woman )               .toBeDefined();
            expect( allLabels.man.total )           .toEqual( 3 );
            expect( allLabels.woman.percent )       .toEqual( 40 );
        });
    });

});