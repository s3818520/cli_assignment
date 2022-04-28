import { useState } from "react"

export default function CommandScreen() {

    const [commandList, setCommandList] = useState([]);
    const [input, setInput] = useState("");
    const commands = ["GET", "SET", "SADD", "SREM", "SMEMBERS", "SINTER", "KEYS", "DEL", "EXPIRE", "TTL", "SAVE", "RESTORE"];

    const removedArray = (array, items) => array.filter(element => { return !items.includes(element) });

    const intersection = (array1, array2) => {
        const intersect = [];
        for (let i = 0; i < array1.length; i++) {
            if (!array2.includes(array1[i])) {
                continue;
            };
            intersect.push(array1[i]);
        };
        return intersect;
    }

    const intersectMultiple = (arrays) => {
        let intersect = arrays[0];

        for (let i = 1; i < arrays.length; i++) {
            intersect = intersection(intersect, arrays[i]);

        };

        return intersect;
    }

    const processCommands = () => {
        setCommandList(previousCommandList => ([...previousCommandList, "> " + input]));
        // console.log(document.getElementById("myInput").value)
        const value = document.getElementById("myInput").value.split(" ");
        const cmd = value[0];
        // console.log(cmd);
        const key = value[1];
        const val = value[2];

        if (cmd == "KEYS") {
            console.log(Object.entries(localStorage));
            if (Object.entries(localStorage).length != 1) {
                Object.entries(localStorage).forEach((key, index) => {
                    if (key[0] == "<snapshot>") {
                        return;
                    }
                    setCommandList(previousCommandList => ([...previousCommandList, key[0]]));
                });

            } else {
                setCommandList(previousCommandList => ([...previousCommandList, "Storage empty"]));
            }
            document.getElementById("myInput").value = "";
            setInput("");
            return;
        } else if (cmd == "SAVE") {

            const currentData = [];

            if (Object.entries(localStorage).length != 1) {
                Object.entries(localStorage).forEach((key, index) => {
                    if (key[0] == "<snapshot>") {
                        return;
                    }
                    const dataKey = key[0];
                    const dataValue = JSON.parse(localStorage.getItem(key[0]));

                    const data = [dataKey, dataValue];

                    //If data has expiration value, keep the remaining timer for when it gets restored
                    if (dataValue[0] != "No expiration") {
                        // clearTimeout(dataValue[0].data);

                        let currentTime = new Date();
                        let expiredTime = dataValue[0].time;

                        const remainingTime = Math.floor((expiredTime - currentTime.getTime()) / 1000);

                        dataValue[0] = remainingTime * 1000;

                    }

                    currentData.push(data);
                });

                localStorage.setItem("<snapshot>", JSON.stringify(currentData));
                setCommandList(previousCommandList => ([...previousCommandList, "Snapshot created"]));

                console.log(currentData);

            } else {
                setCommandList(previousCommandList => ([...previousCommandList, "Storage empty"]));
            }

            document.getElementById("myInput").value = "";
            setInput("");
            return;



        } else if (cmd == "RESTORE") {

            const restoredData = JSON.parse(localStorage.getItem("<snapshot>"));

            if (localStorage.getItem("<snapshot>") != null || localStorage.getItem("<snapshot>") != []) {
                restoredData.forEach(element => {
                    const keyData = element[0];
                    const valueData = element[1];
    
                    if (valueData[0] != "No expiration") {
    
                        const timeout = setTimeout(() => { localStorage.removeItem(keyData); setCommandList(previousCommandList => ([...previousCommandList, "Key " + keyData + " is expired"])); }, valueData[0])
    
                        let currentTime = new Date();
                        let expireData = { data: timeout, time: (currentTime.getTime() + valueData[0]) };
    
                        valueData[0] = expireData;
    
                        localStorage.setItem(keyData, JSON.stringify(valueData));
    
                    }
                });
    
                setCommandList(previousCommandList => ([...previousCommandList, "Data restored"]));
            } else {
                setCommandList(previousCommandList => ([...previousCommandList, "No snapshot available"]));
            }
            
            // console.log(restoredData);
            document.getElementById("myInput").value = "";
            setInput("");
            return;

        }

        if (!commands.includes(cmd)) {
            setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Unknown command"]));
            document.getElementById("myInput").value = "";
            setInput("");
            return;
        }

        if (key == null) {
            setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key input none detected"]));
            document.getElementById("myInput").value = "";
            setInput("");
            return;
        } else if (key == "<snapshot>") {
            setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Invalid key name"]));
            document.getElementById("myInput").value = "";
            setInput("");
            return;
        }

        try {
            if (cmd == "GET") {
                if (val) {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No value in GET command syntax"]));
                } else {
                    if (localStorage.getItem(key) == null) {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key does not exist"]));

                    } else {
                        if (JSON.parse(localStorage.getItem(key))[1] == "Single") {
                            let storedValue = JSON.parse(localStorage.getItem(key));
                            storedValue.splice(0, 2);

                            setCommandList(previousCommandList => ([...previousCommandList, "\"" + storedValue + "\""]));
                        } else {
                            setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key holding a wrong type of value"]));
                        }


                    }

                }

            } else if (cmd == "SET") {
                if (val) {
                    if (value[3]) {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Syntax error. Only a key and a value are required"]));
                    } else {
                        let data = [val];
                        data.unshift("Single")
                        data.unshift("No expiration")
                        localStorage.setItem(key, JSON.stringify(data));

                        setCommandList(previousCommandList => ([...previousCommandList, "Store value " + val + " in key " + key]));

                    }
                } else {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No value detected"]));

                }


            } else if (cmd == "SADD") {

                const inputClone = value;
                inputClone.splice(0, 2);

                let findDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) != index);
                // console.log(inputClone)
                // console.log(findDuplicates(inputClone).length == 0);
                if (findDuplicates(inputClone).length == 0) {
                    if (val) {
                        inputClone.unshift("Set");
                        inputClone.unshift("No expiration");
                        localStorage.setItem(key, JSON.stringify(inputClone))

                        setCommandList(previousCommandList => ([...previousCommandList, "Values stored in key " + key]));

                    } else {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No value detected"]));

                    }
                } else {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Set value contains duplicates of " + "\"" + [...new Set(findDuplicates(inputClone))] + "\""]));

                }


            } else if (cmd == "SREM") {

                //Check if key exists
                if (localStorage.getItem(key) == null) {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key does not exist"]));

                } else {
                    if (JSON.parse(localStorage.getItem(key))[1] == "Set") {
                        const inputClone1 = value;
                        inputClone1.splice(0, 2);

                        const storedValue = JSON.parse(localStorage.getItem(key));

                        let removedValue = [];

                        let findDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) != index);

                        //Check if input has values
                        if (val) {

                            //Check if values have any duplicates
                            if (findDuplicates(inputClone1).length == 0) {
                                inputClone1.forEach(element => {
                                    if (storedValue.includes(element)) {
                                        removedValue.push(element);
                                    }
                                });
                                //Print error if value does not exist
                                if (removedValue.length == 0) {
                                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Value(s) non existed in key"]));
                                    document.getElementById("myInput").value = "";
                                    setInput("");
                                    return;
                                }

                                //Check if the user remove every value in a key, if yes delete the key
                                if (removedArray(storedValue, inputClone1).length == 2) {
                                    localStorage.removeItem(key);
                                    setCommandList(previousCommandList => ([...previousCommandList, "Removed value(s) " + removedValue + " from key " + key]));
                                    setCommandList(previousCommandList => ([...previousCommandList, "Key " + key + " contains 0 value. Deleting this key..."]));

                                    document.getElementById("myInput").value = "";
                                    setInput("");
                                    return;

                                } else {
                                    localStorage.setItem(key, JSON.stringify(removedArray(storedValue, inputClone1)));
                                }

                                setCommandList(previousCommandList => ([...previousCommandList, "Removed value(s) " + removedValue + " from key " + key]));

                            } else {
                                setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No value detected"]));

                            }

                        } else {
                            setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Set value contains duplicates of " + "\"" + [...new Set(findDuplicates(inputClone1))] + "\""]));

                        }
                    } else {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key holding a wrong type of value"]));
                    }


                }

            } else if (cmd == "SMEMBERS") {

                if (localStorage.getItem(key) == null) {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key does not exist"]));
                } else {
                    if (val) {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No value in SMEMBERS command syntax"]));
                    } else {
                        if (JSON.parse(localStorage.getItem(key))[1] == "Set") {
                            let storedValue = JSON.parse(localStorage.getItem(key));
                            storedValue.splice(0, 2);

                            storedValue.forEach((element, index) => {
                                setCommandList(previousCommandList => ([...previousCommandList, (index + 1) + ") " + "\"" + element + "\""]));
                            });
                        } else {
                            setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key holding a wrong type of value"]));

                        }


                    }
                }

            } else if (cmd == "SINTER") {

                const inputClone2 = value;
                inputClone2.splice(0, 1);

                let nullKeys = [];

                inputClone2.forEach(key => {
                    if (localStorage.getItem(key) == null) {
                        nullKeys.push(key)
                    }
                });

                if (nullKeys.length != 0) {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key(s): " + nullKeys + " unavailable"]));
                } else {

                    let listOfArrays = [];
                    inputClone2.forEach(key => {
                        let array = JSON.parse(localStorage.getItem(key));
                        array.splice(0, 2)
                        listOfArrays.push(array);
                        console.log(listOfArrays);
                    });

                    setCommandList(previousCommandList => ([...previousCommandList, JSON.stringify(intersectMultiple(listOfArrays))]));

                }

            } else if (cmd == "DEL") {

                if (localStorage.getItem(key) == null) {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key does not exist"]));
                } else {
                    if (val) {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No value in DEL command syntax"]));
                    } else {
                        localStorage.removeItem(key);
                        setCommandList(previousCommandList => ([...previousCommandList, "Key " + key + " has been removed"]));

                    }

                }

            } else if (cmd == "EXPIRE") {
                //Check if input has value
                if (val) {
                    //Check if input has more than 1 value
                    if (value[3]) {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Syntax error. Only one time value is required"]));
                        //Check if value is an integer
                    } else if (Number.isInteger(parseInt(val)) == false) {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Time value must be an integer"]));
                    } else {

                        if (localStorage.getItem(key) == null) {
                            setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key does not exist"]));
                        } else {

                            let currentTime = new Date();
                            let storedValue = JSON.parse(localStorage.getItem(key));

                            //If this key already has expiration count down, ternimate existing countdown and override it with new countdown
                            if (JSON.parse(localStorage.getItem(key))[0] == "No expiration") {
                                storedValue.shift();

                            } else {

                                const currentData = JSON.parse(localStorage.getItem(key))[0].data;
                                clearTimeout(currentData);

                                storedValue.shift();

                            }

                            const timeout = setTimeout(() => { localStorage.removeItem(key); setCommandList(previousCommandList => ([...previousCommandList, "Key " + key + " is expired"])); }, val * 1000)

                            let expireData = { data: timeout, time: (currentTime.getTime() + val * 1000) };

                            storedValue.unshift(expireData);
                            console.log(storedValue);
                            // // console.log(currentTime.getTime() + val*1000);
                            localStorage.setItem(key, JSON.stringify(storedValue));
                            setCommandList(previousCommandList => ([...previousCommandList, "Set expiration time for key " + key + ". Timer: " + val + " seconds"]));

                        }
                    }
                } else {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No time value detected"]));
                }

            } else if (cmd == "TTL") {

                if (val) {
                    setCommandList(previousCommandList => ([...previousCommandList, "ERROR: No value in TTL command syntax"]));
                } else {
                    if (localStorage.getItem(key) == null) {
                        setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Key does not exist"]));

                    } else {
                        if (JSON.parse(localStorage.getItem(key))[0] == "No expiration") {
                            setCommandList(previousCommandList => ([...previousCommandList, "Key " + key + " currently has no expiration"]));

                        } else {
                            let currentTime = new Date();
                            var expiredTime = JSON.parse(localStorage.getItem(key))[0].time;
                            // console.log(expiredTime);
                            setCommandList(previousCommandList => ([...previousCommandList, "Time remaining for key " + key + " to expire: " + Math.floor((expiredTime - currentTime.getTime()) / 1000) + " seconds"]));
                        }
                    }

                }

            } else if (cmd == "RESTORE") {



            } else {
                setCommandList(previousCommandList => ([...previousCommandList, "ERROR: Unknown command"]));

            }
        } catch (error) {
            console.log(error);
        }

        //Clear input
        document.getElementById("myInput").value = "";
        setInput("");

    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            processCommands();
        }
    }

    return (
        <div className="my-auto">

            <div className="card" style={{ heigh: "100vh" }}>
                <div className="card-header text-center">
                    <h5>WELCOME TO LEDIS</h5>
                </div>

                <div className="card-body bg-dark text-white overflow-auto" >
                    <div className="" >
                        {commandList.map((cmd, index) => {
                            return (<h6>{cmd}</h6>)
                        })}
                    </div>
                </div>

                <div className="card-footer text-center">
                    <div className="input-group input-group-sm mb-3">
                        &gt;Ledis <input type="text" className="form-control ms-2" placeholder="Enter your command..." style={{ border: 0, outline: 0 }} id="myInput" onKeyDown={handleKeyDown} onChange={(e) => { setInput(e.target.value) }} aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm"></input>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => setCommandList([])}>CLEAR COMMAND BOX</button>
                </div>
            </div>


        </div>
    )

}