/* First function buildGraph builds a graph based on an array of routes given as argument. This graph would be returned and later used for pathfinding purposes */

function buildGraph(edges) {
    //Build a graph from a set of roads. The roads are given as 'source'-'destination' which are split to create the graph
    let graph = Object.create(null);
    function addEdge(from, to) {
        if (graph[from] == null) {
	    graph[from] = [to];
	}
	else {
	    graph[from].push(to);
	}
    }
    
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
	addEdge(to, from);
    }
    return graph;
}

/* 
No need to create a class for each element. This could create a messy coupling between classes which have their own internal states. Such programs could be hard to understand and debug in the future.
In this case, just create a simple class which stores the village, the list of undelivered parcels with each having their own destination address.
*/

class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    /* the move function takes a node and sees if it is possible to move to it from the current node using the generated graph */
    
    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        }
        else {
            let parcels = this.parcels.map(p => {
                if (p.place != this.place) {
                    return p;
                }
                return {place: destination, address: p.address};
            }).filter(p => p.place != p.address);
            
            return new VillageState(destination, parcels);
        }
    }
}

/* This function allocates a function random to the VillageState class. This generates random data of parcels for testing purposes */

VillageState.random = function(parcelCount = 5) {
    let parcels = []
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);
        parcels.push({place, address});
    }
/*    console.log("Generated Parcels");
    for (let i = 0; i < parcels.length; i++) {
        console.log(parcels[i]);
    } */
    return new VillageState("Post Office", parcels);
}

/*-------------------------------------------------------------
This code below is used for the random path robot. This robot just takes a random parcel and then navigates through the routes randomly.
This is the initial model. Later ones improve by using predefined routes and path finding graph algorithms
---------------------------------------------------------------*/

function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
}

/* End of the random robot code */

/*---------------------------------------------------------------
The following code implements a pre programmed path robot. This path created such that it visits all the nodes atleast once.
This is then defined in an array and then passed as a memory to the robot. The robot ticks off each location from the list
and visits each one to see which parcels belongs to the place.
-----------------------------------------------------------------*/

const mailRoute = [
    "Alice House", "Cabin", "Alice House", "Bob House",
    "Town Hall", "Daria House", "Ernie House",
    "Grete House", "Shop", "Grete House", "Farm",
    "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
}

/* End of predefined path robot */
    
/*---------------------------------------------------------------
The code below is used to define a graph path finding robot. The most efficient in this program
This robot uses a function to findroute to the destination first, then navigates to the place.
The robot function is named goalOrientedRobot and the route function is findRoute
-----------------------------------------------------------------*/

function findRoute(graph, from, to) {
    let work = [{at: from, route:[]}];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at]) {
            if (place == to) {
                return route.concat(place);
            }
            if (!work.some(w => w.at == place)) {
                work.push({at:place, route: route.concat(place)});
            } 
        }
    }
}

function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        }
        else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}

/* This is the end of the graph path robot */


/* The following function is used to run a robot program. This function can be called with different robots for testing different logic.
for eg. two robots to test which logic is faster or more efficient */

function runRobot(state, robot, memory) {
    for (let turn = 0;;turn++) {
        if (state.parcels.length == 0) {
            return turn;
        }  
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
   }
}

/* The following function can be used to compare the performances of two robots. Given these robot functions as arguments,
this function generates 100 tasks and outputs the average steps for each robot. */

function compareRobots(robot1, robot2) {
    let steps1 = 0;
    let steps2 = 0;
    for (let i = 0; i < 100; i++) {
        let testcase = VillageState.random();
        steps1 = steps1 + runRobot(testcase, robot1, []);
        steps2 = steps2 + runRobot(testcase, robot2, []);
    }
    console.log(`Executed 100 test cases`);
    console.log(`Average(${robot1.name}): ${steps1/100}`);
    console.log(`Average(${robot2.name}): ${steps2/100}`);
}

const roads = [
    "Alice House-Bob House", "Alice House-Cabin",
    "Alice House-Post Office", "Bob House-Town Hall",
    "Daria House-Ernie House", "Daria House-Town Hall",
    "Ernie House-Grete House", "Grete House-Farm",
    "Grete House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Shop",
    "Marketplace-Town Hall", "Shop-Town Hall"
];

const roadGraph = buildGraph(roads);
console.log(roadGraph);
//runRobot(VillageState.random(), randomRobot, []);
compareRobots(routeRobot, goalOrientedRobot);

