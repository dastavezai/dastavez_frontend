import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Spinner, Center, Icon, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, useColorModeValue } from '@chakra-ui/react';
import { FiFile, FiDownload, FiTrash2 } from 'react-icons/fi';
import { fileAPI } from '../../../lib/api';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const MyFilesPanel = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fileAPI.getUserFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
      setError('Failed to load files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} bg={bgColor} h="full" borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <VStack align="stretch" spacing={6} h="full">
        <Box borderBottom="1px solid" borderColor={borderColor} pb={4}>
          <Text fontSize="xl" fontWeight="bold" color={textColor}>My Files</Text>
          <Text fontSize="sm" color="gray.500">Manage all your uploaded documents and resources.</Text>
        </Box>

        <Box flex="1" overflowY="auto">
          {loading ? (
            <Center h="200px">
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : error ? (
            <Center h="200px">
              <Text color="red.500">{error}</Text>
            </Center>
          ) : files.length === 0 ? (
            <Center h="200px">
              <Text color="gray.500">You haven't uploaded any files yet.</Text>
            </Center>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>File Name</Th>
                  <Th>Type</Th>
                  <Th>Size</Th>
                  <Th>Uploaded</Th>
                  <Th isNumeric>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {files.map(file => (
                  <Tr key={file._id || file.fileUrl}>
                    <Td maxW="200px" isTruncated>
                      <HStack>
                        <Icon as={FiFile} color="blue.500" />
                        <Text fontWeight="medium" title={file.fileName}>{file.fileName}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple" fontSize="2xs">{file.fileType?.split('/')[1] || 'Unknown'}</Badge>
                    </Td>
                    <Td><Text fontSize="xs">{formatBytes(file.fileSize)}</Text></Td>
                    <Td><Text fontSize="xs">{new Date(file.createdAt || file.uploadedAt).toLocaleDateString()}</Text></Td>
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing={2}>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiDownload />}
                          as="a"
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default MyFilesPanel;
