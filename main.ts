/*  Binary Clock
    Uses the MicroBit leds to show a simple binary clock

            0   1   2   3   4   <-- LED Columns
        0   *   *   *   *  [*]  AM 
        1   *   *   *   *  [*] 
        2   *   *   *   #   *   <-- Military
        3   *   #   #   #  [#]  PM
        4   #   *   #   #  [#] 
            Hour    Minutes
        Above is showing 12:37 PM
        columns 0,1 --> hours (read bottom up)
        columns 2,3 --> minutes (read bottom up)
        column  4   --> AM (rows 0,1) or PM (rows 3,4)
        row 0, columns 0-3 will note a second heartbeat

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
let hours    : number = 9;            // stores the hour value
let maxHours : number = 12;           // stores the max number of hours before reset
let minHours : number = 1;            // stores the min number that hour can be 
let minutes  : number = 12;           // stores the minute value
let seconds  : number = 0;            // stores the second quadrant value
let time     : string = ""
let AM = 0;
let PM = 1;
let Military = 2;
enum timeMoniker { AM, PM, Military } //is it AM, PM or Military
let ampm = timeMoniker.AM             //is it AM, PM or Military
let adjust   : boolean = true;        // controls binary clock refresh - show everything
let shaken   : boolean = false;       // controls time string display
let previousMillis : number = control.millis();
let previousSecMillis : number = previousMillis;

// ******************************************
//               Global Arrays
// ******************************************
/*  binaryNumber[10][4] --> the first index  - the number 0-9
                           the second index  - the LEDs within that column
    so if you need the binary values for 1,
    the first index item would be 1
    Note: we're only using four LEDs (1-4)
*/
let binaryNumber : number[][] =  [[0,0,0,0], //0
                                  [0,0,0,1], //1
                                  [0,0,1,0], //2
                                  [0,0,1,1], //3
                                  [0,1,0,0], //4
                                  [0,1,0,1], //5
                                  [0,1,1,0], //6
                                  [0,1,1,1], //7
                                  [1,0,0,0], //8
                                  [1,0,0,1]]; //9

//  ampmHand[3][5] --> the first index - AM, PM or Military
//                    the second index - the LEDs within that column
let ampmHand : number[][] =     [[1,1,0,0,0],[0,0,0,1,1],[0,0,1,0,0]];  //AM, PM, Military
let numberArray : number[] = [0,0];  //used to store a number broken into single digits

// ******************************************
//           Interrupt Routines
// ******************************************
input.onGesture(Gesture.Shake, () => {
    //Shake the MicroBit to show time as a string
    if (ampm == Military){
        let isOk = fillNumArray(hours);
        time = numberArray[0].toString() + numberArray[1].toString();
    } else {
        time = hours.toString() + ":";    
    }
    let isOk = fillNumArray(minutes);
    time = (time + numberArray[0].toString() + numberArray[1].toString() + " ");
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
            minHours = 1;
            break;  
        case PM:
            //switch to Military 
            ampm = timeMoniker.Military;
            maxHours = 23;
            minHours = 0;
            break;
        case Military:
            //switch to AM 
            ampm = timeMoniker.AM;
            if (hours > 12) { hours -= 12;}
            maxHours = 12;
            minHours = 1;
            break; 
        default:
          //do nothing
    }
    adjust = true;
})

input.onButtonPressed(Button.A, () => {
    //Adjusts the hours
    if (hours < maxHours) {
        hours += 1;
    } else {
        hours = minHours;
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

function fillNumArray(numValue:number) : boolean{
    numberArray[0] = Math.floor(numValue / 10);
    numberArray[1] = (numValue % 10);
    return true;
}

function showHours():void {
    // Show hours - columns 0 & 1
    // ToDo : check boolean  
    let isOk = fillNumArray(hours);

    for (let x=0; x < 2; x++){
        for (let y=0; y < binaryNumber[numberArray[x]].length; y++){
            if (binaryNumber[numberArray[x]][y]==0){
                led.unplot(x,y+1);
            } else {
                led.plot(x,y+1);
            }
        }
    }
}

function showMinutes():void {
    // Show minutes - columns 2 & 3
    // ToDo : check boolean  
    let isOk = fillNumArray(minutes);

    for (let x=0; x < 2; x++){
        for (let y=0; y < binaryNumber[numberArray[x]].length; y++){
            if (binaryNumber[numberArray[x]][y]==0){
                led.unplot(x+2,y+1);
            } else {
                led.plot(x+2,y+1);
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
        // Handle hour increment based in AM, PM, or Military Time
        if (hours < maxHours){
            hours += 1;
            if (hours = 12){
                switch(ampm){
                    case AM:
                        ampm = timeMoniker.PM;
                        break;
                    case PM:
                        ampm = timeMoniker.AM;
                        break;
                    default:
                        // Military time do nothing
                }
            }
        } else {
            hours = minHours;
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
        previousSecMillis = control.millis()  //to prevent heartbeat after showString
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



