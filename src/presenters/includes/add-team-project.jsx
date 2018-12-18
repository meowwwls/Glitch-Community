import React from "react";
import PropTypes from "prop-types";

import AddTeamProjectPop from "../pop-overs/add-team-project-pop.jsx";
import PopoverContainer from "../pop-overs/popover-container.jsx";

const AddTeamProject = ({ currentUserIsOnTeam, ...props }) => {
  if (!currentUserIsOnTeam) {
    return null;
  }

  return (
    <section className="add-project-container">
      {/* Add disabled={props.projectLimitIsReached} once billing is ready */}
      <PopoverWithButton
        buttonClass={`button add-project has-emoji opens-pop-over ${props.extraButtonClass}`}
        buttonText={<div className="down-arrow" aria-label="options" />}
        passToggleToPop
      />
      
      <PopoverContainer>
        {({ visible, togglePopover }) => (
          <div className="button-wrap">
            
            <button
              className=
              onClick={togglePopover}
            >
              Add Project{" "}
              <span className="emoji bento-box" role="img" aria-label="" />
            </button>
            {visible && (
              <AddTeamProjectPop {...props} togglePopover={togglePopover} />
            )}
          </div>
        )}
      </PopoverContainer>
    </section>
  );
};

AddTeamProject.propTypes = {
  currentUserIsOnTeam: PropTypes.bool.isRequired,
  addProject: PropTypes.func.isRequired,
  teamProjects: PropTypes.array.isRequired,
  extraButtonClass: PropTypes.string,
  api: PropTypes.func.isRequired
};

export default AddTeamProject;
