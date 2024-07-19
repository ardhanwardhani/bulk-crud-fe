import React, { useState, useEffect } from 'react';
import { Container, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Button, TablePagination } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/employee';

const AutosaveEmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployees, setNewEmployees] = useState([]);
  const [deletedEmployeeIds, setDeletedEmployeeIds] = useState([]);
  const [initialEmployees, setInitialEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [autosaveTimer, setAutosaveTimer] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }
    
    const timer = setTimeout(() => {
      handleSave();
    }, 120000);

    setAutosaveTimer(timer);

    // Cleanup timer on component unmount or when dependencies change
    return () => clearTimeout(timer);
  }, [employees, newEmployees, deletedEmployeeIds]);

  const fetchEmployees = () => {
    axios.get(`${API_URL}/list`)
      .then(response => {
        setEmployees(response.data.map(employee => ({ ...employee, isChanged: false })));
        setInitialEmployees(response.data);
      })
      .catch(error => {
        console.error('Error fetching employee data:', error);
      });
  };

  const handleEditChange = (index, field, value, isNew = false) => {
    const list = isNew ? newEmployees : employees;
    const updatedList = [...list];
    updatedList[index][field] = value;

    if (!updatedList[index].isChanged) {
      updatedList[index].isChanged = true;
    }

    isNew ? setNewEmployees(updatedList) : setEmployees(updatedList);
  };

  const handleAdd = () => {
    const newEmployee = { id: Date.now(), firstName: '', lastName: '', branch: '' };
    setNewEmployees([...newEmployees, newEmployee]);
  };

  const handleDelete = (index, isNew = false) => {
    if (isNew) {
      const updatedNewEmployees = newEmployees.filter((_, i) => i !== index);
      setNewEmployees(updatedNewEmployees);
    } else {
      const updatedEmployees = employees.filter((_, i) => i !== index);
      setDeletedEmployeeIds([...deletedEmployeeIds, employees[index].id]);
      setEmployees(updatedEmployees);
    }
  };

  const handleSave = () => {
    const listUpdate = employees
      .filter((employee) => employee.isChanged)
      .map(employee => ({ id: employee.id, firstName: employee.firstName, lastName: employee.lastName, branch: employee.branch }));

    const listCreate = newEmployees;
    const listDelete = deletedEmployeeIds;

    const data = {
      listCreate,
      listUpdate,
      listDelete
    };

    axios.post(`${API_URL}/bulk-action`, data)
      .then(response => {
        console.log('Success:', response.data);
        fetchEmployees(); // Refresh data after saving
        setNewEmployees([]);
        setDeletedEmployeeIds([]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedEmployees = employees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 800, marginLeft: 20 }}>
        <h1>Employee Manager</h1>
        <TableContainer component={Paper} style={{ display: 'block', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleSave} style={{ width: '97%', margin: '10px' }}>
            Save
          </Button>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>
                  <IconButton onClick={handleAdd}>
                    <AddIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee, index) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <TextField
                      size='small'
                      fullWidth
                      value={employee.firstName}
                      onChange={(e) => handleEditChange(index, 'firstName', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      fullWidth
                      value={employee.lastName}
                      onChange={(e) => handleEditChange(index, 'lastName', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      fullWidth
                      value={employee.branch}
                      onChange={(e) => handleEditChange(index, 'branch', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(index)}>
                      <RemoveIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {newEmployees.map((employee, index) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <TextField
                      size='small'
                      fullWidth
                      value={employee.firstName}
                      onChange={(e) => handleEditChange(index, 'firstName', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      fullWidth
                      value={employee.lastName}
                      onChange={(e) => handleEditChange(index, 'lastName', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      fullWidth
                      value={employee.branch}
                      onChange={(e) => handleEditChange(index, 'branch', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(index, true)}>
                      <RemoveIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={employees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Container>
  );
};

export default AutosaveEmployeeTable;
