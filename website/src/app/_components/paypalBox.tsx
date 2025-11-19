"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { OnApproveActions, OnApproveData } from "@paypal/paypal-js";
import { FileToTranscribe } from "@/app/_components/FileToTranscribeType";
import { CircularProgress } from "@mui/material";

function PayPalButtonsOrLoadingSpinner(props: {
  order: () => Promise<any>;
  onApprove: (data: OnApproveData, actions: OnApproveActions) => Promise<void>;
}) {
  const [{ isPending }] = usePayPalScriptReducer();

  return isPending ? (
    <CircularProgress />
  ) : (
    <PayPalButtons
      style={{
        shape: "rect",
        layout: "vertical",
      }}
      createOrder={props.order}
      onApprove={props.onApprove}
    />
  );
}

const PayPalBox = ({
  cart,
  setPaypalOrderStatus,
  setPaypalOrderID,
}: {
  cart: FileToTranscribe[];
  setPaypalOrderStatus: React.Dispatch<React.SetStateAction<string>>;
  setPaypalOrderID: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [message, setMessage] = useState("");

  const newCartRef = useRef(cart);
  useEffect(() => {
    newCartRef.current = cart;
  }, [cart]);

  function createPayPalOrder() {
    return async () => {
      try {
        const response = await fetch("/api/createorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // use the "body" param to optionally pass additional order information
          // like product ids and quantities
          body: JSON.stringify(newCartRef.current),
        });

        const orderData = await response.json();

        if (orderData.orderID) {
          console.log("orderData", orderData);
          return orderData.orderID;
        } else {
          const errorDetail = orderData?.details?.[0];
          const errorMessage = errorDetail
            ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
            : JSON.stringify(orderData);

          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(error);
        setMessage(`Could not initiate PayPal Checkout...${error}`);
      }
    };
  }

  function capturePayPalOrder() {
    return async (data: OnApproveData, actions: OnApproveActions) => {
      try {
        const response = await fetch(`/api/captureorder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderID: data.orderID,
          }),
        });

        const orderData = await response.json();
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const errorDetail = orderData?.details?.[0];

        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
          // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
          return actions.restart();
        } else if (errorDetail) {
          // (2) Other non-recoverable errors -> Show a failure message
          throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
        } else {
          // (3) Successful transaction -> Show confirmation or thank you message
          // Or go to another URL:  actions.redirect('thank_you.html');
          const transaction = orderData.purchase_units[0].payments.captures[0];
          setMessage(
            `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`,
          );
          setPaypalOrderStatus(orderData.status);
          setPaypalOrderID(orderData.id);
          console.log(
            "Capture result",
            orderData,
            //JSON.stringify(orderData, null, 2),
          );
        }
      } catch (error) {
        console.error(error);
        setMessage(`Sorry, your transaction could not be processed...${error}`);
      }
    };
  }

  return (
    // <PayPalScriptProvider options={initialOptions}>
    <PayPalButtonsOrLoadingSpinner
      order={createPayPalOrder()}
      onApprove={capturePayPalOrder()}
    />
    // </PayPalScriptProvider>
  );
};

export default PayPalBox;
