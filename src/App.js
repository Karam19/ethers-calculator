import React, { useState } from "react";

import Wrapper from "./components/Wrapper";
import Screen from "./components/Screen";
import ButtonBox from "./components/ButtonBox";
import Button from "./components/Button";
import { abi, contractAddress } from "./const.js";
import { ethers } from "ethers";

// let [firstClick, setFirstClick] = useState(true);
// let [contract, setContract] = useState();
let contract = null;

const btnValues = [
  ["Start", "C", "/"],
  [7, 8, 9, "X"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, "-+", "="],
];

const toLocaleString = (num) =>
  String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1 ");

const removeSpaces = (num) => num.toString().replace(/\s/g, "");

const math = (a, b, sign) =>
  sign === "+" ? a + b : sign === "-" ? a - b : sign === "X" ? a * b : a / b;

const App = () => {
  let [calc, setCalc] = useState({
    sign: "",
    num: 0,
    res: 0,
  });

  const numClickHandler = (e) => {
    const value = e;
    if (removeSpaces(calc.num).length < 16) {
      setCalc({
        ...calc,
        num:
          removeSpaces(calc.num) % 1 === 0 && !calc.num.toString().includes(".")
            ? toLocaleString(Number(removeSpaces(calc.num + value)))
            : toLocaleString(calc.num + value),
        res: !calc.sign ? 0 : calc.res,
      });
    }
  };

  const signClickHandler = (e) => {
    setCalc({
      ...calc,
      sign: e,
      res: !calc.num
        ? calc.res
        : !calc.res
        ? calc.num
        : toLocaleString(
            math(
              Number(removeSpaces(calc.res)),
              Number(removeSpaces(calc.num)),
              calc.sign
            )
          ),
      num: 0,
    });
  };

  const defineContract = () => {
    console.log("Let us define the conrtact");
    let provider = ethers.getDefaultProvider("goerli");
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    contract = new ethers.Contract(contractAddress, abi, provider);
    console.log(contract);
    // setContract(contract);
  };

  const calcUsingSmartContract = async (a, b, sign) => {
    let currentValue = 0;
    // let provider = ethers.getDefaultProvider();
    // // We connect to the Contract using a Provider, so we will only
    // // have read-only access to the Contract
    // let contract = new ethers.Contract(contractAddress, abi, provider);
    console.log("calculating");
    console.log(contract);
    if (sign === "+") {
      currentValue = await contract.add(a, b);

      console.log("value is: ", currentValue);
    } else if (sign === "-") {
      currentValue = await contract.subtract(a, b);

      console.log("value is: ", currentValue);
    } else if (sign === "X") {
      currentValue = await contract.mul(a, b);

      console.log("value is: ", currentValue);
    } else if (sign === "/") {
      currentValue = await contract.divide(a, b);

      console.log("value is: ", currentValue);
    }
    return currentValue;
  };

  const equalsClickHandler = async () => {
    if (calc.sign && calc.num) {
      let result = await calcUsingSmartContract(
        Number(removeSpaces(calc.res)),
        Number(removeSpaces(calc.num)),
        calc.sign
      );
      console.log("result is: ", result);
      setCalc({
        ...calc,
        res:
          calc.num === "0" && calc.sign === "/"
            ? "Can't divide with 0"
            : toLocaleString(parseInt(result._hex, 16)),
        sign: "",
        num: 0,
      });
    }
  };

  const invertClickHandler = () => {
    setCalc({
      ...calc,
      num: calc.num ? toLocaleString(removeSpaces(calc.num) * -1) : 0,
      res: calc.res ? toLocaleString(removeSpaces(calc.res) * -1) : 0,
      sign: "",
    });
  };

  const resetClickHandler = () => {
    setCalc({
      ...calc,
      sign: "",
      num: 0,
      res: 0,
    });
  };

  return (
    <Wrapper>
      <Screen value={calc.num ? calc.num : calc.res} />
      <ButtonBox>
        {btnValues.flat().map((btn, i) => {
          return (
            <Button
              key={i}
              className={
                btn === "="
                  ? "equals"
                  : btn === "C"
                  ? "clear"
                  : btn === "Start"
                  ? "start"
                  : ""
              }
              value={btn}
              onClick={async () => {
                console.log("btn is", btn);
                if (btn === "Start") {
                  defineContract();
                } else if (btn === "C") {
                  resetClickHandler();
                } else if (btn === "-+") {
                  invertClickHandler();
                } else if (btn === "=") {
                  await equalsClickHandler();
                } else if (
                  btn === "/" ||
                  btn === "X" ||
                  btn === "-" ||
                  btn === "+"
                ) {
                  signClickHandler(btn);
                } else {
                  numClickHandler(btn);
                }
              }}
            />
          );
        })}
      </ButtonBox>
    </Wrapper>
  );
};

export default App;
