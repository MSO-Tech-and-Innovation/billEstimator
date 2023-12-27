        var current_step = 1;
        //var irrPrice = 0.735;
        var stateWaterPlan = 0.0032;
        //Minimum average winter consumption
        var minAveWin = 30;
        //block 1 volume and price
        var block1 = 0
        var price1 = 9.17
        //block 2 volume and price
        var block2 = 0
        var price2 = 10.09
        //block 3 volume and price
        var block3 = 0
        var price3 = 10.55

        //Water monthly service charge eff 1/1/2024 (ord #9929)
        var price_list = [
            {"true":5.15, "false":5.70},
            {"true":6.15, "false":6.80},
            {"true":7.10, "false":7.80},
            {"true":9.75, "false":10.70},
            {"true":29.00, "false":31.90},
            {"true":36.10, "false":39.70},
            {"true":53.55, "false":58.95},
            {"true":72.00, "false":79.20},
            {"true":94.40, "false":103.85},
            {"true":109.85, "false":120.85},
            {"true":146.50, "false":161.15},
            {"true":5.15, "false":5.70},
        ];
        //monthly sewer service charge
        var sewer_charge = {"true": 17.25, "false": 18.95};
        var sewer_volume = {"true": 11.02, "false": 14.33}
        var current_storm_water_base = [//2024 prices
            {'ERU':.37, 'charge':2.94},
            {'ERU':.66, 'charge':5.24},
            {'ERU':.67, 'charge':5.32},
            {'ERU':1, 'charge':7.94},
            {'ERU':1.25, 'charge':9.93},
            {'ERU':1.8, 'charge':14.29},
            {'ERU':2.5, 'charge':19.85},
        ]
        var last_year_storm_water_base = [//2023 prices
        {'ERU':.37, 'charge':2.73},
        {'ERU':.66, 'charge':4.87},
        {'ERU':.67, 'charge':4.94},
        {'ERU':1, 'charge':7.38},
        {'ERU':1.25, 'charge':9.23},
        {'ERU':1.8, 'charge':13.28},
        {'ERU':2.5, 'charge':18.45},
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
        //Solid Waste rates

        var in_city_limits = true;
        var trash_cart = [20.13, 21.88, 24.20, 7.66]; //respective sizes are 35G, 65G, 95G, low income rate
        var additional65 = 4.37;
        var additional95 = 5.53;

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
            //Sewer volume charge is $10 per 1000 gallons
            var sewer_volume_charge = 0
            if (in_city_limits){
                sewer_volume_charge = sewer_volume.true
                }
                else{
                    sewer_volume_charge = sewer_volume.false
                };
            var sewerVolumeCost = sewerVolume * sewer_volume_charge;

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