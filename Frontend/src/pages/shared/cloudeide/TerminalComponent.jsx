import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const TerminalComponent = ({ socket }) => {
  const terminalRef = useRef(null);
  const termInstance = useRef(null);

  useEffect(() => {
    const term = new XTerm({cursorBlink: true,
  // Ye line terminal ko default browser selection karne deti hai
  disableStdin: false,
  // Mouse events ko control karne ke liye
  screenReaderMode: true});
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    termInstance.current = term;

    const handleData = (data) => {
      term.write(data);
    };
    socket.on("terminal:data", handleData);

    const handleInput = (data) => {
      socket.emit("terminal:write", data);
    };
    const inputDisposable = term.onData(handleInput);

    return () => {
      socket.off("terminal:data", handleData);
      inputDisposable.dispose();
      term.dispose();
      termInstance.current = null;
    };
  }, [socket]);

  return <div ref={terminalRef} className="h-full w-full" />;
};

export default TerminalComponent;

// import React, { useEffect, useRef } from "react";
// import { Terminal as XTerm } from "xterm";
// import { FitAddon } from "xterm-addon-fit";
// import "xterm/css/xterm.css";

// // const TerminalComponent = ({ socket }) => {
// const TerminalComponent = ({ socket, terminalId, projectId }) => {
//   const terminalRef = useRef(null);
//   const termInstance = useRef(null);

//   useEffect(() => {
//     const term = new XTerm({
//       cursorBlink: true,
//       // Ye line terminal ko default browser selection karne deti hai
//       disableStdin: false,
//       // Mouse events ko control karne ke liye
//       screenReaderMode: true,
//     });
//     const fitAddon = new FitAddon();
//     term.loadAddon(fitAddon);
//     term.open(terminalRef.current);

//     socket.emit("terminal:init", {
//       projectId,
//       terminalId,
//     });

//     fitAddon.fit();
//     termInstance.current = term;

//     const handleData = ({ terminalId: id, data }) => {
//       if (id !== terminalId) return;

//       term.write(data);
//     };

//     socket.on("terminal:data", handleData);

//     const handleInput = (data) => {
//       socket.emit("terminal:write", {
//         terminalId,
//         data,
//       });
//     };
//     const inputDisposable = term.onData(handleInput);

//     return () => {
//       socket.emit("terminal:close", {
//         terminalId,
//       });
//       socket.off("terminal:data", handleData);
//       inputDisposable.dispose();
//       term.dispose();
//       termInstance.current = null;
//     };
//   }, [socket]);

//   return <div ref={terminalRef} className="h-full w-full" />;
// };

// export default TerminalComponent;
