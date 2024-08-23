// Devide list of games 
const devideList = (games, chunk) => {
    let divided = [];
    let temp = { games: [] };
    let count = 0;

    games.forEach(game => {
        if (count === chunk) {
            divided.push(temp);
            temp = { games: [] };
            count = 0;
        }
        temp.games.push(game);
        count++;
    });

    divided.push(temp);
    
    return divided;
}

export { devideList };