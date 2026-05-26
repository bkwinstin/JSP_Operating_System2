import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile, UserRole, ROLE_META } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Users, Shield, UserCheck, Briefcase, Trash2, ChevronDown, UserPlus, X } from 'lucide-react';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'staff',     label: 'Employee',           description: 'Access to general content and all-staff documents' },
  { value: 'executive', label: 'Executive',           description: 'Access to all content including executive-only documents' },
  { value: 'jsp_admin', label: 'JSP Administration',  description: 'Access to JSP Admin content, executive swimlanes and documents' },
  { value: 'admin',     label: 'Admin',               description: 'Full system access including editing and user management' },
];

interface RoleDropdownProps {
  currentRole: UserRole;
  userId: string;
  selfId: string;
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
}

function RoleDropdown({ currentRole, userId, selfId, onRoleChange }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isSelf = userId === selfId;
  const meta = ROLE_META[currentRole];

  async function handleSelect(role: UserRole) {
    if (role === currentRole || isSelf) return;
    setSaving(true);
    setOpen(false);
    await onRoleChange(userId, role);
    setSaving(false);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => !isSelf && setOpen(o => !o)}
        disabled={saving || isSelf}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: '20px',
          border: `1px solid ${meta.bg}`,
          background: meta.bg, color: meta.tc,
          fontSize: '10px', fontWeight: 700, fontFamily: 'Verdana,sans-serif',
          cursor: isSelf ? 'default' : 'pointer',
          opacity: saving ? 0.6 : 1,
          transition: 'opacity 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {saving ? 'Saving...' : meta.label}
        {!isSelf && <ChevronDown size={10} />}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 101,
            background: '#fff', borderRadius: '10px', border: '1px solid #E4E2D6',
            boxShadow: '0 6px 24px rgba(31,29,28,.15)', minWidth: '220px', overflow: 'hidden',
          }}>
            {ROLE_OPTIONS.map(opt => {
              const m = ROLE_META[opt.value];
              const isSelected = opt.value === currentRole;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px', border: 'none', cursor: 'pointer',
                    background: isSelected ? '#F2F1E9' : '#fff',
                    borderBottom: '1px solid #F2F1E9',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = '#F9F8F4'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isSelected ? '#F2F1E9' : '#fff'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px',
                      background: m.bg, color: m.tc,
                      fontSize: '9px', fontWeight: 700, fontFamily: 'Verdana,sans-serif',
                    }}>
                      {m.label}
                    </span>
                    {isSelected && <span style={{ fontSize: '9px', color: '#9C8878' }}>Current</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9C8878', marginTop: '3px', fontFamily: 'Verdana,sans-serif' }}>
                    {opt.description}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface InviteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function InviteModal({ onClose, onSuccess }: InviteModalProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!email || !displayName || !password) {
      showToast('All fields are required', 'error');
      return;
    }
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password, display_name: displayName, role }),
      }
    );

    let json: any = {};
    const rawText = await res.text();
    try {
      json = JSON.parse(rawText);
    } catch {
      showToast(`Server error (${res.status}): ${rawText.slice(0, 200)}`, 'error');
      setSaving(false);
      return;
    }

    if (!res.ok || json.error) {
      showToast(json.error || `HTTP ${res.status}: ${rawText.slice(0, 200)}`, 'error');
      setSaving(false);
      return;
    }

    showToast(`User ${displayName} created successfully`);
    setSaving(false);
    onSuccess();
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '24px 28px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 40px rgba(31,29,28,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C' }}>Add New User</div>
            <div style={{ fontSize: '11px', color: '#9C8878', marginTop: '2px' }}>Create a new account and assign a role</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9C8878', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        {[
          { label: 'Full Name', value: displayName, setter: setDisplayName, type: 'text', placeholder: 'Jane Smith' },
          { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'jane@jsp.org' },
          { label: 'Temporary Password', value: password, setter: setPassword, type: 'password', placeholder: 'Min. 8 characters' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: '13px' }}>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9C8878', marginBottom: '5px', fontFamily: 'Verdana,sans-serif' }}>
              {f.label}
            </label>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.setter(e.target.value)}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #E4E2D6', borderRadius: '7px', fontSize: '12px', fontFamily: 'Verdana,sans-serif', color: '#1F1D1C', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9C8878', marginBottom: '8px', fontFamily: 'Verdana,sans-serif' }}>
            Role
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ROLE_OPTIONS.map(opt => {
              const m = ROLE_META[opt.value];
              const isSelected = role === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '8px',
                    border: `1.5px solid ${isSelected ? m.bg : '#E4E2D6'}`,
                    background: isSelected ? m.bg + '40' : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                  }}
                >
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px',
                    background: m.bg, color: m.tc,
                    fontSize: '9px', fontWeight: 700, fontFamily: 'Verdana,sans-serif',
                    flexShrink: 0,
                  }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6A453A', fontFamily: 'Verdana,sans-serif' }}>
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 18px', borderRadius: '7px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
            <UserPlus size={12} />
            {saving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setUsers(data as UserProfile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleRoleChange(userId: string, role: UserRole) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId);
    if (error) {
      showToast('Failed to update role: ' + error.message, 'error');
    } else {
      showToast('Role updated successfully');
      fetchUsers();
    }
  }

  async function handleDelete(userId: string, displayName: string) {
    if (!window.confirm(`Remove ${displayName} from the system? This cannot be undone.`)) return;
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    if (error) {
      showToast('Failed to remove user: ' + error.message, 'error');
    } else {
      showToast(`${displayName} has been removed`);
      fetchUsers();
    }
  }

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleCounts = {
    staff:     users.filter(u => u.role === 'staff').length,
    executive: users.filter(u => u.role === 'executive').length,
    jsp_admin: users.filter(u => u.role === 'jsp_admin').length,
    admin:     users.filter(u => u.role === 'admin').length,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([
            { role: 'admin'     as UserRole, icon: Shield },
            { role: 'executive' as UserRole, icon: UserCheck },
            { role: 'jsp_admin' as UserRole, icon: Briefcase },
            { role: 'staff'     as UserRole, icon: Users },
          ]).map(({ role, icon: Icon }) => {
            const m = ROLE_META[role];
            return (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: m.bg, color: m.tc, fontSize: '11px', fontWeight: 700, fontFamily: 'Verdana,sans-serif' }}>
                <Icon size={11} />
                {roleCounts[role]} {m.label}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}
        >
          <UserPlus size={12} />
          Add User
        </button>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '9px 14px', border: '1px solid #E4E2D6', borderRadius: '8px', fontSize: '12px', fontFamily: 'Verdana,sans-serif', color: '#1F1D1C', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#9C8878', fontSize: '12px' }}>Loading users...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(u => {
            const isSelf = u.id === currentUser?.id;
            return (
              <div
                key={u.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px',
                  border: `1px solid ${isSelf ? '#FABE3D40' : '#E4E2D6'}`,
                  background: isSelf ? '#FFFDF0' : '#fff',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: ROLE_META[u.role].bg, color: ROLE_META[u.role].tc,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif',
                  flexShrink: 0,
                }}>
                  {u.display_name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
                      {u.display_name}
                    </span>
                    {isSelf && (
                      <span style={{ fontSize: '9px', color: '#9C8878', fontFamily: 'Verdana,sans-serif', background: '#F2F1E9', padding: '1px 6px', borderRadius: '8px' }}>You</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9C8878', fontFamily: 'Verdana,sans-serif', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <RoleDropdown
                    currentRole={u.role}
                    userId={u.id}
                    selfId={currentUser?.id || ''}
                    onRoleChange={handleRoleChange}
                  />
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(u.id, u.display_name)}
                      title="Remove user"
                      style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: '#C9A89A', padding: '4px', borderRadius: '5px',
                        display: 'flex', alignItems: 'center',
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#B03A2E'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C9A89A'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9C8878', fontSize: '12px', fontFamily: 'Verdana,sans-serif' }}>
              No users found matching "{search}"
            </div>
          )}
        </div>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
