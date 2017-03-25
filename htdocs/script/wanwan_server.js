Wanwan.Server = {};
Wanwan.Server.URL = "";
Wanwan.Server.Messages = [];


Wanwan.Server.Check = function() {
    for(var i = 0; i < Wanwan.Server.Messages.length; ++i) {
        console.log("From the server: " + Wanwan.Server.Messages[i]);
        var packet = Wanwan.Server.Dehexify(Wanwan.Server.Messages[i]);

        switch(packet[0]) {
          case "WANWANMSG":
            if (packet.length != 6) continue;
            Wanwan.Canvas.AddMessage(
                packet[1], packet[2],
                packet[3],
                packet[4]
            );
            break;
          default:;
        }      

    }
    Wanwan.Server.Messages = [];

};





Wanwan.Server.HexLookup = [];
for(var i = 0; i < 103; ++i) Wanwan.Server.HexLookup.push(0);
Wanwan.Server.HexLookup[48] = 0;
Wanwan.Server.HexLookup[49] = 1;
Wanwan.Server.HexLookup[50] = 2;
Wanwan.Server.HexLookup[51] = 3;
Wanwan.Server.HexLookup[52] = 4;
Wanwan.Server.HexLookup[53] = 5;
Wanwan.Server.HexLookup[54] = 6;
Wanwan.Server.HexLookup[55] = 7;
Wanwan.Server.HexLookup[56] = 8;
Wanwan.Server.HexLookup[57] = 9;

Wanwan.Server.HexLookup[97] = 10;
Wanwan.Server.HexLookup[98] = 11;
Wanwan.Server.HexLookup[99] = 12;
Wanwan.Server.HexLookup[100] = 13;
Wanwan.Server.HexLookup[101] = 14;
Wanwan.Server.HexLookup[102] = 15;



Wanwan.Server.HexToUint8 = function(string) {
    return Wanwan.Server.HexLookup[string.charCodeAt(0)]*16 +
           Wanwan.Server.HexLookup[string.charCodeAt(1)];
}
Wanwan.Server.Dehexify = function(string) {
    
    var out = [];
    var item;
    var n;
    var value;
    for(var i = 0; i < string.length; i+=2) {
        item = "";

        // shoudl always start with a 00
        value = Wanwan.Server.HexToUint8(string.substring(i, i+2));
        if (value != 0) return [];
        i += 2;

        value = Wanwan.Server.HexToUint8(string.substring(i, i+2));        
        while(value != 0 && i < string.length) {
            item += String.fromCharCode(value);
            i += 2;
            value = Wanwan.Server.HexToUint8(string.substring(i, i+2));
        }

        // we ended but without a 00
        if (value != 0) 
            return [];

        out.push(item);
    }
    return out;
}


Wanwan.Server.ReverseHexLookup = [];
Wanwan.Server.ReverseHexLookup[0] = "0";
Wanwan.Server.ReverseHexLookup[1] = "1";
Wanwan.Server.ReverseHexLookup[2] = "2";
Wanwan.Server.ReverseHexLookup[3] = "3";
Wanwan.Server.ReverseHexLookup[4] = "4";
Wanwan.Server.ReverseHexLookup[5] = "5";
Wanwan.Server.ReverseHexLookup[6] = "6";
Wanwan.Server.ReverseHexLookup[7] = "7";
Wanwan.Server.ReverseHexLookup[8] = "8";
Wanwan.Server.ReverseHexLookup[9] = "9";

Wanwan.Server.ReverseHexLookup[10] = "a";
Wanwan.Server.ReverseHexLookup[11] = "b";
Wanwan.Server.ReverseHexLookup[12] = "c";
Wanwan.Server.ReverseHexLookup[13] = "d";
Wanwan.Server.ReverseHexLookup[14] = "e";
Wanwan.Server.ReverseHexLookup[15] = "f";

Wanwan.Server.Uint8ToHex = function(value) {
    if (value > 255) value = 255;
    return Wanwan.Server.ReverseHexLookup[Math.floor(value/16)] +
           Wanwan.Server.ReverseHexLookup[value%16];
}

Wanwan.Server.Hexify = function(argvec) {
    var str = "";
    for(var i = 0; i < argvec.length; ++i) {
        str += "00";
        for(var n = 0; n < argvec[i].length; ++n) {
            str += Wanwan.Server.Uint8ToHex(String.charCodeAt(argvec[i][n]));
        }
        str += "00";
    }
    return str;
}

