
import React, { Component } from 'react';
import './App.css';

class KanbanBoard extends Component {
  state = {
    tickets: [],
    users: [],
    grouping: 'status',
    sorting: 'priority',
    displayOptionsVisible: false,
  };

  componentDidMount() {
    this.fetchData();
    this.loadViewState();
  }
  getUserById(userId) {
    const { users } = this.state;
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "Unknown User";
  }
  fetchData() {
    const url = "https://api.quicksell.co/v1/internal/frontend-assignment";
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const { tickets, users } = data;
        this.setState({ tickets, users });
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }

  loadViewState() {
    const viewedState = localStorage.getItem('viewedState');
    if (viewedState) {
      this.setState(JSON.parse(viewedState));
    }
  }

  saveViewState() {
    localStorage.setItem('viewedState', JSON.stringify(this.state));
  }

  toggleDisplayOptions = () => {
    this.setState((prevState) => ({
      displayOptionsVisible: !prevState.displayOptionsVisible,
    }), this.saveViewState);
  };

  onGroupingChange = (event) => {
    const newGrouping = event.target.value;
    this.setState({
      grouping: newGrouping,
    }, this.saveViewState);
  };

  onSortingChange = (event) => {
    const newSorting = event.target.value;
    this.setState({
      sorting: newSorting,
    }, this.saveViewState);
  };

  render() {
    const { tickets, users, grouping, sorting, displayOptionsVisible } = this.state;

    if (tickets.length === 0 || users.length === 0) {
      return <div>Loading...</div>;
    }

    const groupedTickets = tickets.reduce((acc, ticket) => {
      const group = grouping === 'user' ? this.getUserById(ticket.userId) : ticket[this.state.grouping];
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(ticket);
      return acc;
    }, {});

    return (
      <div className="kanban-board">
        <div className="header">
          {displayOptionsVisible ? (
            <div>
              <button onClick={this.toggleDisplayOptions}>Close Options</button>
              <select onChange={this.onGroupingChange} value={grouping}>
                <option value="status">Group by Status</option>
                <option value="user">Group by User</option>
                <option value="priority">Group by Priority</option>
              </select>
              <select onChange={this.onSortingChange} value={sorting}>
                <option value="priority">Sort by Priority</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          ) : (
            <button onClick={this.toggleDisplayOptions}>Display Options</button>
          )}
        </div>
        <div className="board">
          {Object.keys(groupedTickets).map(group => (
            <div className="ticket-group" key={group}>
                 {grouping === 'user' ? (
                  <h2 className="ticket-group-title">Assigned to: {group}</h2>
                ) : (
                  <h2 className="ticket-group-title">{group}</h2>
                )}
             
              <ul className="ticket-list">
                {groupedTickets[group].sort((a, b) => {
                  if (sorting === 'priority') {
                    return b.priority - a.priority;
                  } else {
                    return a.title.localeCompare(b.title);
                  }
                }).map(ticket => (
                  <li className="ticket" key={ticket.id}>
                    <div className={`ticket-container ${ticket.status.toLowerCase()}`}>
                      <h3 className="ticket-title">{ticket.title}</h3>
                      <div className="ticket-content">
                        <div className="ticket-details">
                          <span className="ticket-tag">Tag: {ticket.tag.join(', ')}</span>
                          <span className="ticket-id">ID: {ticket.id}</span>
                         
                          <span className="ticket-priority">
                            Priority: {ticket.priority}
                          </span>
                          
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default KanbanBoard;
