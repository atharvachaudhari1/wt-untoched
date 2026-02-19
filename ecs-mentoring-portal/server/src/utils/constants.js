const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
  ADMIN: 'admin',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const SESSION_TYPE = {
  INDIVIDUAL: 'individual',
  GROUP: 'group',
};

const NOTE_CATEGORY = {
  ACADEMIC: 'academic',
  BEHAVIORAL: 'behavioral',
  PERSONAL: 'personal',
  CAREER: 'career',
  GENERAL: 'general',
};

const NOTE_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

const ANNOUNCEMENT_SCOPE = {
  DEPARTMENT: 'department',
  MENTOR_GROUP: 'mentor_group',
  SPECIFIC: 'specific',
};

const ANNOUNCEMENT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  SESSION_STATUS,
  SESSION_TYPE,
  NOTE_CATEGORY,
  NOTE_SEVERITY,
  ANNOUNCEMENT_SCOPE,
  ANNOUNCEMENT_PRIORITY,
};
