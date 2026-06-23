const TagBadge = ({ tag, onClick }) => (
    <span
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.15rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: `${tag.color}22`,
            color: tag.color,
            border: `1px solid ${tag.color}44`,
            cursor: onClick ? 'pointer' : 'default',
        }}
    >
        {tag.name}
    </span>
);

export default TagBadge;
