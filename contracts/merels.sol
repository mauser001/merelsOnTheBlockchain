// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Test {
    
    uint constant GAME_COST = 1 ether;
    uint constant MIN_FINSIHED_GAMES_BFORE_LOTTERY = 2;
    enum COLORS{ UNDEFINED, WHITE, BLACK}
    
    address private owner;
    
    struct Game {
        uint round;
        uint index;
        address white;
        address black;
    }
    
    uint public activeGames;
    uint public finishedGames;
    uint public finishedGamesSinceLastPayout;
    
    address[] public allPlayers;
    
    /*
        mapping for quicker access to own Game
    */
    mapping(address => uint) public gameNumberByAddress;
    
    /*
    * list of all games
    */
    Game[] public games;
    
    mapping(address => uint) public roundsPlayedByAddress;
    
    mapping(address => uint) public gamesWonByAddress;
    
    /*
    * played positions
    */
    mapping(uint => mapping(int => COLORS)) public positions;
    
    //Event game started
    event GameStarted(address indexed _sender);
    
    //Event game joined
    event GameJoined(address indexed _sender, address indexed _joined);
    
    //Event made move
    event MadeMove(address indexed _sender, int _toPos, int _fromPos, int _removePos);

    //Event WON
    event WonGame(address indexed _sender);
    
    
    /**
     * @dev Set contract deployer as owner
     */
    constructor() {
        owner = msg.sender; 
    }
    
    
    function startGame() public payable{
         require(gameNumberByAddress[msg.sender] == 0, "Already playing");
         require(msg.value == GAME_COST, "1 eth required to start a game");
         uint index = games.length;
         games.push(Game({
             round: 0,
             index: index,
             white: msg.sender,
             black: address(0)
         }));
         gameNumberByAddress[msg.sender] = index + 1;
         activeGames++;
         addPlayerToPlayerList(msg.sender);
    
        emit GameStarted(msg.sender);
    }
    
    function joinGame(address oponent) public payable{
         require(gameNumberByAddress[msg.sender] == 0, "Already playing");
         require(gameNumberByAddress[oponent] > 0, "Oponent has no open game");
         require(msg.value == GAME_COST, "1 eth required to start a game");
         uint index = gameNumberByAddress[oponent] - 1;
         require(games[index].black == address(0) , "Game already in progres");
         games[index].black = msg.sender;
         gameNumberByAddress[msg.sender] = gameNumberByAddress[oponent];
         addPlayerToPlayerList(msg.sender);
         emit GameJoined(msg.sender, oponent);
    }
    
    function makeMove(int toPos, int fromPos, int removePos) public payable{
        require(gameNumberByAddress[msg.sender] > 0, "No active game");
        //require(msg.value > 100, "100 required to join a game");
        Game storage game = games[gameNumberByAddress[msg.sender] - 1];
        COLORS ownColor = game.white == msg.sender ? COLORS.WHITE : COLORS.BLACK;
        require((ownColor == COLORS.WHITE) == (game.round % 2 == 0), "Not your turn");
        
        require(toPos >= 0 && toPos < 24 && positions[game.index][toPos] == COLORS.UNDEFINED, "Not a valid to position");
        int posInCircle = toPos % 8;
        int circle = toPos / 8;
        
        if(game.round < 18)
        {
            require(fromPos < 0, "Moving not allowed before turn 18");
            positions[game.index][toPos] = ownColor;
        }
        else
        {
            require(fromPos >= 0 && fromPos < 24 && positions[game.index][fromPos] == ownColor, "Not a valid from pos");
            uint ownCount = countColor(game.index, ownColor);
            if(ownCount > 3)
            {
                int fromPosInCircle = fromPos % 8;
                int fromCircle = fromPos / 8;
                if(fromCircle == circle)
                {
                    int dif = posInCircle - fromPosInCircle;
                    require(dif == 1 || dif == -1 || (fromPosInCircle == 7 && posInCircle == 0) || (fromPosInCircle == 0 && posInCircle == 7), "Move not allowed");
                }
                else
                {
                    require(((fromCircle - circle == 1 || fromCircle - circle == -1) && fromPosInCircle == posInCircle) && fromPosInCircle % 2 == 1, "Move not allowed");
                }
            }
            
            positions[game.index][fromPos] = COLORS.UNDEFINED;
            positions[game.index][toPos] = ownColor;
        }
        
        bool ownerHasMill = checkMill(toPos, ownColor, game);
        
        bool won = false;
        if(ownerHasMill)
        {
            COLORS oponentColor = ownColor == COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
            require(removePos >= 0 && removePos < 24 && positions[game.index][removePos] == oponentColor && !checkMill(removePos, oponentColor, game), "Remove not possible");
            
            positions[game.index][removePos] = COLORS.UNDEFINED;
            if(game.round >= 18)
            {
                uint countOponent = countColor(game.index, oponentColor);
                if(countOponent < 3)
                {
                    // WON! so we pay out
                    payable(msg.sender).transfer(GAME_COST + GAME_COST / 2);
                    finishedGames++;
                    finishedGamesSinceLastPayout++;
                    gamesWonByAddress[msg.sender]++;
                    cleanUpFinishedGame(game);
                    won = true;
                }
            }
        }
        else
        {
            require(removePos < 0, "remove not allowed");
        }
        
        game.round ++;
        emit MadeMove(msg.sender, toPos, fromPos, removePos);
        if(won)
        {
            emit WonGame(msg.sender);
        }
    }
    
    function addPlayerToPlayerList(address player) private
    {
        bool found = false;
        for(uint i = 0; i < allPlayers.length; i++)
        {
            if(allPlayers[i] == player)
            {
                found = true;
                break;
            }
        }
        if(!found)
        {
            allPlayers.push(player);
        }
    }
    
    function cleanUpFinishedGame(Game storage game) private
    {
        uint gameIndex = game.index;
        uint lastIndex = games.length -1;
        gameNumberByAddress[game.white] = 0;
        gameNumberByAddress[game.black] = 0;
        Game storage last = games[lastIndex];
        last.index = gameIndex;
        delete games[gameIndex];
        games[gameIndex] = last;
        games.pop();
        
        for(int i = 0; i < 24; i++)
        {
            positions[gameIndex][i] = positions[lastIndex][i];
            positions[lastIndex][i] = COLORS.UNDEFINED;
        }
        
        gameNumberByAddress[last.white] = last.index + 1;
        gameNumberByAddress[last.black] = last.index + 1;
        
    }
    
    function checkMill(int pos, COLORS color, Game storage game) private view returns(bool)
    {
        int posInCircle = pos % 8;
        int circle = pos / 8;
        bool isMill = false;
        require(posInCircle != 7, "in pos 7");
        if(posInCircle % 2 == 1)
        {
            if(posInCircle == 7 && positions[game.index][pos-1] == color && positions[game.index][pos-7] == color)
            {
                isMill = true;
            }
            else if(posInCircle < 7 && positions[game.index][pos-1] == color && positions[game.index][pos+1] == color)
            {
                isMill = true;
            }
            else if(circle == 0 && positions[game.index][pos+8] == color && positions[game.index][pos+16] == color)
            {
                isMill = true;
            }
            else if(circle == 1 && positions[game.index][pos-8] == color && positions[game.index][pos+8] == color)
            {
                isMill = true;
            }
            else if(circle == 2 && positions[game.index][pos-8] == color && positions[game.index][pos-16] == color)
            {
                isMill = true;
            }
        }
        else if(posInCircle == 0)
        {
            if(positions[game.index][pos+1] == color && positions[game.index][pos+2] == color)
            {
                isMill = true;
            }
            else if(positions[game.index][pos+6] == color && positions[game.index][pos+7] == color)
            {
                isMill = true;
            }
        }
        else if(posInCircle == 6)
        {
            if(positions[game.index][pos-1] == color && positions[game.index][pos-2] == color)
            {
                isMill = true;
            }
            else if(positions[game.index][pos+1] == color && positions[game.index][pos-6] == color)
            {
                isMill = true;
            }
        }
        else
        {
            
            if(positions[game.index][pos+1] == color && positions[game.index][pos+2] == color)
            {
                isMill = true;
            }
            else if(positions[game.index][pos-1] == color && positions[game.index][pos-2] == color)
            {
                isMill = true;
            }
        }
        return isMill;
    }
    
    function countColor(uint gameIndex, COLORS color) private view returns(uint)
    {
        uint count = 0;
        for(int i = 0; i < 24; i++)
            {
                if(positions[gameIndex][i] == color)
                {
                    count++;
                }
            }
        return count;
    }
    
    function gameCount() public view returns(uint){
        return games.length;
    }
}