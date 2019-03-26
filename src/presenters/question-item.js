import React from 'react';
import PropTypes from 'prop-types';

import { getEditorUrl } from '../models/project';
import { Link } from './includes/link';
import Image from '../components/image/image';

const iconHelp = 'https://cdn.glitch.com/f7224274-1330-4022-a8f2-8ae09dbd68a8%2Fask-for-help.svg?1494954687906';

function truncateQuestion(question) {
  const max = 140;
  if (question.length > max) {
    return `${question.substring(0, max - 1)}…`;
  }
  return question;
}

function truncateTag(tag) {
  const max = 15;
  return tag.substring(0, max);
}

const QuestionItem = ({ colorOuter, colorInner, domain, question, tags, userAvatar, userColor, userLogin, path, line, character }) => (
  <>
    <Image className="help-icon" src={iconHelp} alt="Help icon" />
    <Link to={getEditorUrl(domain, path, line, character)} data-track="question" data-track-label={domain}>
      <div className="project" style={{ backgroundColor: colorOuter }}>
        <div className="project-container" style={{ backgroundColor: colorInner }}>
          <Image className="avatar" src={userAvatar} style={{ backgroundColor: userColor }} alt="" />
          <div className="button">Help {userLogin}</div>
          <div className="description question" title={question}>
            {truncateQuestion(question)}
          </div>
          <div className="description tags">
            {tags.map((tag) => (
              <div key={tag} className="tag" title={tag}>
                {truncateTag(tag)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  </>
);
QuestionItem.propTypes = {
  colorOuter: PropTypes.string.isRequired,
  colorInner: PropTypes.string.isRequired,
  domain: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  userAvatar: PropTypes.string.isRequired,
  userColor: PropTypes.string.isRequired,
  userLogin: PropTypes.string.isRequired,
  path: PropTypes.string,
  line: PropTypes.number,
  character: PropTypes.number,
};

QuestionItem.defaultProps = {
  path: '',
  line: 0,
  character: 0,
};

export default QuestionItem;
