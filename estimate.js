        var current_step = 1;
        //var irrPrice = 0.735;
        var stateWaterPlan = 0.0032;
        //Minimum average winter consumption
        var minAveWin = 30;
        //Change #1: block pricing
        //block 1 volume and price
        var block1 = 0
        var price1 = 11.18
        //block 2 volume and price
        var block2 = 0
        var price2 = 12.30
        //block 3 volume and price
        var block3 = 0
        var price3 = 12.86
        //Change #2: water service charge - (meter size)
        //Water monthly service charge eff 1/1/2026
        var price_list = [
            {"true":5.75, "false":6.30},
            {"true":6.85, "false":7.55},
            {"true":7.90, "false":8.70},
            {"true":10.80, "false":11.85},
            {"true":32.00, "false":35.20},
            {"true":39.85, "false":43.85},
            {"true":59.10, "false":65.00},
            {"true":79.40, "false":87.35},
            {"true":104.15, "false":114.55},
            {"true":121.15, "false":133.25},
            //{"true":153.85, "false":169.35}, //Can't find this size anymore?
            {"true":5.75, "false":6.30},
        ];
        //Change #3: Sewer charges
        var sewer_charge = {"true": 19.10, "false": 21.00};
        var sewer_volume = {"true": 13.35, "false": 17.36};
        //Change #5: Storm Water charges
        var current_storm_water_base = [//2026 prices
            {'ERU':.60, 'charge':6.43},
            {'ERU':.80, 'charge':8.57},
            {'ERU':1, 'charge':10.71},
            {'ERU':1.25, 'charge':13.39},
            {'ERU':1.7, 'charge':18.21},
        ]
        var last_year_storm_water_base = [//2025 prices
            {'ERU':.37, 'charge':3.16},
            {'ERU':.66, 'charge':5.64},
            {'ERU':.67, 'charge':5.72},
            {'ERU':1, 'charge':8.54},
            {'ERU':1.25, 'charge':10.68},
            {'ERU':1.8, 'charge':15.37},
            {'ERU':2.5, 'charge':21.35},
        ]
        var formatDollar = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        });
        var eru_table = function(current_year){

            var table_div = document.getElementById('eruTable');
            try {
                table_div.innerHTML = ""
            }
            catch(err){
                console.log(err)
            }
            finally{
                console.log("Updating ERU chart")
            }
            var newBody = document.createElement("tbody");
            newBody.id = "eru_prices";
            var row = document.createElement("tr");
            var leftLabel = document.createElement("th");
            leftLabel.textContent = "Price"
            var rightLabel = document.createElement("th");
            rightLabel.textContent = "Corresponding ERU"
            //table_div.removeChild("td")
            //begin constructing table here:
            row.appendChild(leftLabel)
            row.appendChild(rightLabel)
            newBody.appendChild(row)
            table_div.appendChild(newBody)
            if (current_year){
                for(var i = 0; i< current_storm_water_base.length; i++){
                    var tableBody = document.getElementById('eru_prices');
                    var row = document.createElement("tr");
                    var price = document.createElement("td");
                    price.textContent = "$" + current_storm_water_base[i].charge.toString()
                    var eru_value = document.createElement("td");
                    eru_value.textContent = current_storm_water_base[i].ERU
                    row.appendChild(price)
                    row.appendChild(eru_value)
                    tableBody.appendChild(row)
                    table_div.appendChild(tableBody)
                }

            }
            else{
                for(var i = 0; i< last_year_storm_water_base.length; i++){
                    var tableBody = document.getElementById('eru_prices');
                    var row = document.createElement("tr");
                    var price = document.createElement("td");
                    price.textContent = "$" + last_year_storm_water_base[i].charge.toString()
                    var eru_value = document.createElement("td");
                    eru_value.textContent = last_year_storm_water_base[i].ERU
                    row.appendChild(price)
                    row.appendChild(eru_value)
                    tableBody.appendChild(row)
                    table_div.appendChild(tableBody)
                }
            }
        };
        //Change #4: Solid Waste charges

        var in_city_limits = true;
        var trash_cart = [22.09, 24.01, 26.55, 8.40]; //respective sizes are 35G, 65G, 95G, low income rate
        var additional65 = 4.79;
        var additional95 = 6.07;

        var reveal = function(){
            var inside = document.getElementById('Inside');
            var form = document.getElementById("row-form");
            form.style = "display : block";
            if (inside.checked){
                in_city_limits = true;
            }
            else{
                in_city_limits = false;
            };
        };  

        

        var update_costs = function(){
            //cost variables
            var total = 0;
            var WQA = document.getElementById("WQA").value;
            var waterUsed = document.getElementById("waterUsed").value;
            var ERU = document.getElementById("eru").value;
            var eru_index = document.getElementById("eru").selectedIndex;
            //Water base charge
            var selected_meter = document.getElementById('waterMeter').value
            var meterCharge = '';
            if (in_city_limits){
                meterCharge = price_list[selected_meter].true
            }
            else{
                meterCharge = price_list[selected_meter].false
            }

            //Water Volume Charge 

            //block 1
            //If your winter quarterly average is greater than the minimum WQA
            //translation from excel
            var getblock1 = function(WQA, minAveWin, waterUsed){
            if(WQA>minAveWin){
                if (waterUsed>(WQA*1.25)){
                   block1 = WQA*1.25
                }
                else{
                    block1 = waterUsed
                }
            }
            else if(waterUsed>minAveWin*1.25){
                block1 = minAveWin*1.25
            }
            else{
                block1 = waterUsed
            }
            };

//block 2
//=IF(F$2>P$2,IF(F$4>F$2*2,F$2*2-F$2*1.25,IF(F$4>F$2*1.25,F$4-F$2*1.25,0)),IF(F$4>P$2*2,P$2*2-P$2*1.25,IF(F$4>P$2*1.25,F$4-P$2*1.25,0)))
            var getblock2 = function(){
            if(WQA>minAveWin){
                if(waterUsed>WQA*2){
                    block2 = (WQA*2)-(WQA*1.25)
                }
                else{
                    if(waterUsed>WQA*1.25){
                        block2 = waterUsed-(WQA*1.25)
                    }
                    else{
                        block2 = 0
                    }
                }

            }
            else{
                if(waterUsed>minAveWin*2){
                    block2 = (minAveWin*2)-(minAveWin*1.25)

                }
                else{
                    if(waterUsed>minAveWin*1.25){
                        block2 = waterUsed-(minAveWin*1.25)
                    }
                else{
                    block2 = 0

            }}}};


//block 3
            var getblock3 = function(){
            if(WQA>minAveWin){
                if(waterUsed>WQA*2){
                    block3 = waterUsed-(WQA*2)
                }
                else{
                    block3 = 0;
                };
            }
            else if(waterUsed>minAveWin*2){
                    block3 = waterUsed-(minAveWin*2)
                }
            else
                block3 = 0};
            getblock1(WQA, minAveWin, waterUsed);
            getblock2();
            getblock3();

            var subtotal1 = ((block1/10) * price1)
            var subtotal2 = ((block2/10) * price2)
            var subtotal3 = ((block3/10) * price3)
            var totalWaterVolume = subtotal1 + subtotal2 + subtotal3
            var stateFee = waterUsed * stateWaterPlan;
            //sewer base calculation
            var sewerBaseCharge = '';
            var sewerVolume = '';
            var getSewerBase = function(){
                if (in_city_limits){
                sewerBaseCharge = sewer_charge.true
                }
                else{
                    sewerBaseCharge = sewer_charge.false
                };
            };

            //sewer volume calculation based on WQA
            var getSewerVol = function(){
                waterUsed = Number(waterUsed);
                WQA = Number(WQA);
                if (waterUsed<WQA){
                    sewerVolume = waterUsed;
                }
                else if (waterUsed>=WQA) {
                    sewerVolume = WQA
                };
            };
            getSewerBase();
            getSewerVol();
            //Sewer volume charge is $12.22 per 1000 gallons
            var sewer_volume_charge = 0
            if (in_city_limits){
                sewer_volume_charge = sewer_volume.true
                }
                else{
                    sewer_volume_charge = sewer_volume.false
                };
            var sewerVolumeCost = sewerVolume * (sewer_volume_charge/10);

            //Storm Water Base
            var stormBaseCharge = current_storm_water_base[eru_index].charge;

            //Solid Waste
            var cartSize = document.getElementById("mainCart").selectedIndex;
            var additionalMed = document.getElementById("sixtyFive").value;
            var additionalLarge = document.getElementById("nintyFive").value;
            var solidWasteFee = trash_cart[cartSize];
            var moreCarts = (additionalMed*additional65) + (additionalLarge*additional95);

            //Create and display table
            var meterChargeDiv = document.getElementById('meterCharge')
            meterChargeDiv.textContent = formatDollar.format(meterCharge);
            var stateFeeDiv = document.getElementById("stateFee");
            stateFeeDiv.textContent = formatDollar.format(stateFee);
            var block1Div = document.getElementById("block1");
            block1Div.textContent = formatDollar.format(subtotal1);
            var block2Div = document.getElementById("block2");
            block2Div.textContent = formatDollar.format(subtotal2);
            var block3Div = document.getElementById("block3");
            block3Div.textContent = formatDollar.format(subtotal3);
            var sewerBaseDiv = document.getElementById("sewerBase");
            sewerBaseDiv.textContent = formatDollar.format(sewerBaseCharge);
            var sewerVolumeDiv = document.getElementById("sewerVolumeCharge");
            sewerVolumeDiv.innerHTML = formatDollar.format(sewerVolumeCost);
            var stormBase = document.getElementById("stormBase");
            stormBase.textContent = formatDollar.format(stormBaseCharge);
            var solidWaste = document.getElementById("solidWaste");
            var totalSolidWaste = solidWasteFee + moreCarts;
            solidWaste.textContent = formatDollar.format(totalSolidWaste);
            //total cost and subtotals
            var waterSubDiv = document.getElementById("waterSub");
            waterSubDiv.textContent = formatDollar.format(meterCharge+stateFee+totalWaterVolume);
            var sewerSubDiv = document.getElementById("sewerSub");
            sewerSubDiv.textContent = formatDollar.format(sewerBaseCharge+sewerVolumeCost);
            var stormSubDiv = document.getElementById("stormSub");
            stormSubDiv.textContent = formatDollar.format(stormBaseCharge);
            var solidwasteSubDiv = document.getElementById("solidwasteSub");
            solidwasteSubDiv.textContent = formatDollar.format(totalSolidWaste);
            var totalDiv = document.getElementById('total')
            var runningTotal = meterCharge + totalWaterVolume + sewerBaseCharge + sewerVolumeCost + stormBaseCharge + totalSolidWaste + stateFee
            totalDiv.innerHTML = formatDollar.format(runningTotal)
        
        };
        var update_eru_chart = function(){
            var true_radio = document.getElementById("currentYearTrue");
            if (true_radio.checked){
                eru_table(true)
            }
            else{
                eru_table(false)
            };
        };

        var next_step = function(){
            current_step = current_step +1;
            if (current_step == 4){
                //update_eru_chart()
            }
            if(current_step == 5){
                update_costs()
                var targetButton = document.getElementById("nextButton");
                targetButton.style = "display: none";
                var updateButton = document.getElementById("updateButton");
                updateButton.style = "display: block";
            }
            var div_name = "question_"+String(current_step);
            var next_div = document.getElementById(div_name);
            next_div.style = "display : block";
            
        };