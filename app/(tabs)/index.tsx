import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

const index: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = (email: string, password: string) => {
    // Simulación de inicio de sesión en el frontend
    const defaultEmail = "cristian@gmail.com";
    const defaultPassword = "123456789";

    setLoading(true);

    if (email === defaultEmail && password === defaultPassword) {
      const fakeToken = "fake-jwt-token";
      // Simular guardado de token
      Alert.alert("¡Éxito!", "Inicio de Sesión correcto", [
        { text: "Ok", onPress: () => {
            setLoading(false);
            // Redirige a la página de login
            navigation.navigate('HomeLogin');
          }
        }
      ]);
    } else {
      setLoading(false);
      Alert.alert("Error", "Email o contraseña incorrectos", [{ text: "Ok" }]);
    }
  };

  const handleSubmit = () => {
    handleLogin(email, pass);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebQuest</Text>

      {loading && <ActivityIndicator size="large" color="#fff" />}

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu Correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu Contraseña"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
        />

        <Text style={styles.linkText} onPress={() => navigation.navigate('ForgotPass')}>
          Olvidé la contraseña. Recuperar
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>

        <Text style={styles.linkText}>
          No tienes cuenta?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Regístrate</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#95D5B2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    color: '#1B4332',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#1B4332',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    color: '#FFF',
    fontSize: 18,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#FFF',
    marginTop: 10,
  },
  link: {
    color: '#95D5B2',
    textDecorationLine: 'underline',
  }
});

export default index;
