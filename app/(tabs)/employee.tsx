// Employees.tsx
import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { inviteEmployee, deleteEmployee } from '../../lib/employeeapi';

export default function EmployeesScreen() {
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // For quick testing we used placeholders for names/title; you can replace with inputs
      await inviteEmployee(email, user.id, 'John', 'Doe', 'Mr');
      Alert.alert('Success', 'Employee invited');
      setEmail('');
    } catch (err: any) {
      Alert.alert('Error', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      await deleteEmployee(employeeId, user.id);
      Alert.alert('Success', 'Employee deleted');
      setEmployeeId('');
    } catch (err: any) {
      Alert.alert('Error', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Manage Employees
      </Text>

      <Text>Email to invite:</Text>
      <TextInput
        style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button title={loading ? 'Please wait...' : 'Invite Employee'} onPress={handleInvite} disabled={loading} />

      <View style={{ marginVertical: 20 }} />

      <Text>Employee ID to delete:</Text>
      <TextInput
        style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        value={employeeId}
        onChangeText={setEmployeeId}
        autoCapitalize="none"
      />
      <Button title={loading ? 'Please wait...' : 'Delete Employee'} onPress={handleDelete} disabled={loading} />
    </View>
  );
}
