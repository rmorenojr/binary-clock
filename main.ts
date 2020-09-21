/*  Binary Clock
    Uses the MicroBit leds to show a simple binary clock

        0   1   2   3   4   <-- LED Columns
        *   *   *   *  [*]  AM 
        *   *   *   *  [*] 
        *   *   *   #   *   <-- Military
        *   #   #   #  [#]  PM
        #   *   #   #  [#] 
        Hour    Minutes
        Above is showing 12:37 PM
        columns 0,1 --> hours
        columns 2,3 --> minutes
        column  4   --> AM (rows 0,1) or PM (rows 3,4)
        New the first row, columns 0-3 will note a second heartbeat

    Uses:
        arrays
        enum
        control.millis()
        input.onGesture
        input.onButtonPressed
        function
*/

// ******************************************
//              Global Variables
// ******************************************
let hours   : number = 9;           // stores the hour value
let maxHours: number = 12;          // stores the max number of hours before reset
let minutes : number = 12;          // stores the minute value
let seconds : number = 0;           // stores the second quadrant value
let time : string = ""
let AM = 0;
let PM = 1;
let Military = 2;
enum timeMoniker { AM, PM, Military }      //is it AM, PM or Military
let ampm = timeMoniker.AM           //is it AM, PM or Military
let adjust  : boolean = true;       // controls binary clock refresh - show everything
let shaken  : boolean = false;      // controls time string display
let previousMillis : number = control.millis();
let previousSecMillis : number = previousMillis;

// ******************************************
//               Global Arrays
// ******************************************
/*  hourhand[25][2][5] --> the first index  - the hour 0-24
                           the second index - the led column 0-1
                           the third index  - the leds within that column 0-4
    so if you need the binary values for hour 12,
    the first index item would be 12
*/
let hourHand : number[][][] =  [[[0,0,0,0,0],[0,0,0,0,0]], //00
                                [[0,0,0,0,0],[0,0,0,0,1]], //01
                                [[0,0,0,0,0],[0,0,0,1,0]], //02
                                [[0,0,0,0,0],[0,0,0,1,1]], //03
                                [[0,0,0,0,0],[0,0,1,0,0]], //04
                                [[0,0,0,0,0],[0,0,1,0,1]], //05
                                [[0,0,0,0,0],[0,0,1,1,0]], //06
                                [[0,0,0,0,0],[0,0,1,1,1]], //07
                                [[0,0,0,0,0],[0,1,0,0,0]], //08
                                [[0,0,0,0,0],[0,1,0,0,1]], //09
                                [[0,0,0,0,1],[0,0,0,0,0]], //10
                                [[0,0,0,0,1],[0,0,0,0,1]], //11
                                [[0,0,0,0,1],[0,0,0,1,0]], //12
                                [[0,0,0,0,1],[0,0,0,1,1]], //13
                                [[0,0,0,0,1],[0,0,1,0,0]], //14
                                [[0,0,0,0,1],[0,0,1,0,1]], //15
                                [[0,0,0,0,1],[0,0,1,1,0]], //16
                                [[0,0,0,0,1],[0,0,1,1,1]], //17
                                [[0,0,0,0,1],[0,1,0,0,0]], //18
                                [[0,0,0,0,1],[0,1,0,0,1]], //19
                                [[0,0,0,1,0],[0,0,0,0,0]], //20
                                [[0,0,0,1,0],[0,0,0,0,1]], //21
                                [[0,0,0,1,0],[0,0,0,1,0]], //22
                                [[0,0,0,1,0],[0,0,0,1,1]], //23
                                [[0,0,0,1,0],[0,0,1,0,0]]]; //24

//  minHand[60][2][5]
let minHand : number[][][] =   [[[0,0,0,0,0],[0,0,0,0,0]], //00
                                [[0,0,0,0,0],[0,0,0,0,1]], //01
                                [[0,0,0,0,0],[0,0,0,1,0]], //02
                                [[0,0,0,0,0],[0,0,0,1,1]], //03
                                [[0,0,0,0,0],[0,0,1,0,0]], //04
                                [[0,0,0,0,0],[0,0,1,0,1]], //05
                                [[0,0,0,0,0],[0,0,1,1,0]], //06
                                [[0,0,0,0,0],[0,0,1,1,1]], //07
                                [[0,0,0,0,0],[0,1,0,0,0]], //08
                                [[0,0,0,0,0],[0,1,0,0,1]], //09
                                [[0,0,0,0,1],[0,0,0,0,0]], //10
                                [[0,0,0,0,1],[0,0,0,0,1]], //11
                                [[0,0,0,0,1],[0,0,0,1,0]], //12
                                [[0,0,0,0,1],[0,0,0,1,1]], //13
                                [[0,0,0,0,1],[0,0,1,0,0]], //14
                                [[0,0,0,0,1],[0,0,1,0,1]], //15
                                [[0,0,0,0,1],[0,0,1,1,0]], //16
                                [[0,0,0,0,1],[0,0,1,1,1]], //17
                                [[0,0,0,0,1],[0,1,0,0,0]], //18
                                [[0,0,0,0,1],[0,1,0,0,1]], //19
                                [[0,0,0,1,0],[0,0,0,0,0]], //20
                                [[0,0,0,1,0],[0,0,0,0,1]], //21
                                [[0,0,0,1,0],[0,0,0,1,0]], //22
                                [[0,0,0,1,0],[0,0,0,1,1]], //23
                                [[0,0,0,1,0],[0,0,1,0,0]], //24
                                [[0,0,0,1,0],[0,0,1,0,1]], //25
                                [[0,0,0,1,0],[0,0,1,1,0]], //26
                                [[0,0,0,1,0],[0,0,1,1,1]], //27
                                [[0,0,0,1,0],[0,1,0,0,0]], //28
                                [[0,0,0,1,0],[0,1,1,0,0]], //29
                                [[0,0,0,1,1],[0,0,0,0,0]], //30
                                [[0,0,0,1,1],[0,0,0,0,1]], //31
                                [[0,0,0,1,1],[0,0,0,1,0]], //32
                                [[0,0,0,1,1],[0,0,0,1,1]], //33
                                [[0,0,0,1,1],[0,0,1,0,0]], //34
                                [[0,0,0,1,1],[0,0,1,0,1]], //35
                                [[0,0,0,1,1],[0,0,1,1,0]], //36
                                [[0,0,0,1,1],[0,0,1,1,1]], //37
                                [[0,0,0,1,1],[0,1,0,0,0]], //38
                                [[0,0,0,1,1],[0,1,0,0,1]], //39
                                [[0,0,1,0,0],[0,0,0,0,0]], //40
                                [[0,0,1,0,0],[0,0,0,0,1]], //41
                                [[0,0,1,0,0],[0,0,0,1,0]], //42
                                [[0,0,1,0,0],[0,0,0,1,1]], //43
                                [[0,0,1,0,0],[0,0,1,0,0]], //44
                                [[0,0,1,0,0],[0,0,1,0,1]], //45
                                [[0,0,1,0,0],[0,0,1,1,0]], //46
                                [[0,0,1,0,0],[0,0,1,1,1]], //47
                                [[0,0,1,0,0],[0,1,0,0,0]], //48
                                [[0,0,1,0,0],[0,1,0,0,1]], //49
                                [[0,0,1,0,1],[0,0,0,0,0]], //50
                                [[0,0,1,0,1],[0,0,0,0,1]], //51
                                [[0,0,1,0,1],[0,0,0,1,0]], //52
                                [[0,0,1,0,1],[0,0,0,1,1]], //53
                                [[0,0,1,0,1],[0,0,1,0,0]], //54
                                [[0,0,1,0,1],[0,0,1,0,1]], //55
                                [[0,0,1,0,1],[0,0,1,1,0]], //56
                                [[0,0,1,0,1],[0,0,1,1,1]], //57
                                [[0,0,1,0,1],[0,1,0,0,0]], //58
                                [[0,0,1,0,1],[0,1,0,0,1]]]; //59

//  ampmHand[3][5]
let ampmHand : number[][] =     [[1,1,0,0,0],[0,0,0,1,1],[0,0,1,0,0]];  //AM, PM, Military

// ******************************************
//           Interrupt Routines
// ******************************************
input.onGesture(Gesture.Shake, () => {
    //Shake the MicroBit to show time as a string
    time = (hours.toString() + ":" + minutes.toString() + " ");
    switch (ampm){
        case AM:
            time += "AM";
            break;  
        case PM:
            time += "PM";
            break;
        case Military:
            time += "hours";
            break 
        default:
            //do nothing
    }
    shaken = true;
})

input.onButtonPressed(Button.AB, () => {
    //Adjusts the AM/PM value 
    switch(ampm){
        case AM:
            //switch to PM
            ampm = timeMoniker.PM;
            if (hours > 12) { hours -= 12;}
            maxHours = 12;
            break;  
        case PM:
            //switch to Military 
            ampm = timeMoniker.Military;
            maxHours = 24;
            break;
        case Military:
            //switch to AM 
            ampm = timeMoniker.AM;
            if (hours > 12) { hours -= 12;}
            maxHours = 12;
            break; 
        default:
          //do nothing
    }
    adjust = true;
})

input.onButtonPressed(Button.A, () => {
    //Adjusts the hours
    if (hours < 23) {
        hours += 1;
    } else {
        hours = 0;
    }
    adjust = true;
})

input.onButtonPressed(Button.B, () => {
    //Adjusts the minutes
    if (minutes < 59) {
        minutes += 1;
    } else {
        minutes = 0;
    }
    adjust = true;
})

// ******************************************
//                functions
// ******************************************

function showHours():void {
    // Show hours - columns 0 & 1
    for (let x=0; x < 2; x++){
        for (let y=0; y < hourHand[hours][x].length; y++){
            if (hourHand[hours][x][y]==0){
                led.unplot(x,y);
            } else {
                led.plot(x,y);
            }
        }
    }
}

function showMinutes():void {
    // Show minutes - columns 2 & 3
    for (let x=0; x < 2; x++){
        for (let y=0; y < minHand[minutes][x].length; y++){
            if (minHand[minutes][x][y]==0){
                led.unplot(x+2,y);
            } else {
                led.plot(x+2,y);
            }
        }
    }
}

function showAmPm():void{
    //show AM, PM, or Military - on column 4
    let x : number
    switch (ampm){
        case AM:
            x = AM;
            break;
        case PM:
            x = PM;
            break; 
        case Military:
            x = Military;
            break;
        default:
            //do nothing 
    }
    for (let i=0; i < ampmHand[0].length; i++){
        if (ampmHand[x][i]==0){
            led.unplot(4, i);
        } else {
            led.plot(4,i);
        }
    }
 
}

function showSeconds():void{
    for (let x = 0; x < 4; x++){
        if (x == seconds){
            led.plot(x, 0)
        } else {
            led.unplot(x, 0)
        }
    }
}

function incrementTime(){
    if (minutes < 59) {
        minutes += 1;
    } else {
        minutes = 0;
        //ToDo: military time
        switch (ampm){
            case AM: 
            case PM: 
                if (hours < 12){
                    hours += 1;
                } else {
                    hours = 1;
                    switch(ampm){
                        case AM:
                            ampm = timeMoniker.PM 
                            break 
                        case PM:
                            ampm = timeMoniker.AM
                    }
                }
            case Military: 
                if (hours < 23){
                    hours += 1;
                } else {
                    hours = 0;
                }
                break;
            default:
                // do nothing
        }
        showHours();
        showAmPm();
    }
    showMinutes();
}

function incrementSeconds(){
    if (seconds < (4 -1)){
        seconds +=1;
    } else {
        seconds = 0;
    }
    showSeconds();
}

// ******************************************
//           Start - Run once
// ******************************************
basic.clearScreen();
//End Start 

// ******************************************
//              forever Loop
// ******************************************
basic.forever(() => {
    if (adjust){
        // Refresh the binary clock
        //Show hours
        showHours();
        //Show Minutes
        showMinutes();
        //Show AM or PM 
        showAmPm();
        //show Seconds Quandrant
        showSeconds()
        adjust = false;
    }
    if (shaken){
        basic.clearScreen();
        basic.showString(time);
        basic.clearScreen();
        pause(1000);
        shaken = false;
        adjust = true;
    }
    if ((control.millis()-previousSecMillis) >= 1000){
        previousSecMillis += 1000;
        incrementSeconds()
    }
    if ((control.millis()-previousMillis) >= 60000) {
        previousMillis += 60000;
        incrementTime()
    }
})



