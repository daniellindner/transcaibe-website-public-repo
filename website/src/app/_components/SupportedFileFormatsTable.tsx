import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function SupportedFileFormatsTable() {
  const fileFormats = [
    "flac",
    "mp3",
    "mp4",
    "mpga",
    "m4a",
    "ogg",
    "wav",
    "webm",
  ];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Supported File Formats
      </Typography>

      <TableContainer component={Paper}>
        <Table aria-label="supported file formats table">
          <TableHead>
            <TableRow>
              <TableCell>File Format</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fileFormats.map((format, index) => (
              <TableRow key={index}>
                <TableCell>{format.toUpperCase()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default SupportedFileFormatsTable;
