#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/stat.h>
#include <libgen.h>
#include <ctype.h>
#include <sys/types.h>

/*
MIT No Attribution

Copyright 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT 
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Build the folder structure I typically use when starting a new Siril astrophotograpy project.

structure:
    /viewsessionname
       /biases
       /darks
       /flats
       /lights

To compile this program, you will need a compiler already installed.  
A typical compile statement is:
    gcc -o sirilprogramhelper sirilprogramhelper.c

You can move or copy the resulting binary to someplace that is in your PATH that 
is accessible from a terminal session.  Running the program will create a folder 
name that you provide along with the Siril required sub folders.

You MUST edit the default folder structure to reflect where you keep your original 
*.fit folders.  The last folder doesn't matter since you'll be editing the '.sh' file 
that gets created when you run this.  Search the source code for 'editme' to get
to the area that needs editing.

NB:  I did this to help myself with the Siril process, and did not spend a lot of 
time on it to make it bullet proof before adding it to the public repository.
And yes, I'm aware this could have been done with only a shell script.

    
*/

#define BUFFER_SIZE 1024
#define BUFFER_SIZE_LARGE 2048
#define MAX_LEN 1024
#define DEFAULT_PROGNAME "newastro"
#define MAXSIZE 50

void usage(char *progname);
int count_whitespace(char *string);
void createFolder(const char *folder_name);
int folder_exists(const char *folder_name);
void createSubFolders(const char *folder_name);
char *strreplace(char *s, const char *s1, const char *s2);
void createShellCopyScript(const char *folder_name);
int EndsWith(const char *str, const char *suffix);
int appendStringToArray(char *shellstatements[], int maxsize, const char *newString);
int saveArray(char *shellstatements[], const char *filename);
char *str_replace(char *orig, char *rep, char *with);

int main(int argc, char *argv[])
{
    printf("\033[2J\033[1;1H"); // clear the terminal window

    char cwd[BUFFER_SIZE];
    if (getcwd(cwd, sizeof(cwd)) == NULL)
    {
        perror("getcwd() error");
        return 1;
    }

    if (argc != 2)
    {
        usage(basename(argv[0]));
        exit(EXIT_FAILURE);
    }

    struct stat st;
    char *sessionname = argv[1];

    if (count_whitespace(sessionname) != 0)
    {
        usage(basename(argv[0]));
        exit(EXIT_FAILURE);
    }

    char newsessionname[BUFFER_SIZE];
    snprintf(newsessionname, sizeof(newsessionname), "%s/%s", cwd, sessionname);
    int folderchecker = folder_exists(newsessionname);

    // printf("Session name: %s\n", newsessionname);
    // printf("sessionname: %s\n", sessionname);

    if (folderchecker == 0)
    {
        createFolder(newsessionname);
        printf("Session folder created:\n%s\n", newsessionname);
    }

    createSubFolders(newsessionname);
    createShellCopyScript(newsessionname);

    return EXIT_SUCCESS;
}

char *strreplace(char *s, const char *s1, const char *s2) {
    char *p = strstr(s, s1);
    if (p != NULL) {
        size_t len1 = strlen(s1);
        size_t len2 = strlen(s2);
        if (len1 != len2)
            memmove(p + len2, p + len1, strlen(p + len1) + 1);
        memcpy(p, s2, len2);
    }
    return s;
}

int folder_exists(const char *folder_name) {
    struct stat stats;

    // Check if the folder exists
    if (stat(folder_name, &stats) == 0 && S_ISDIR(stats.st_mode)) {
        return 1; // Folder exists
    } else {
        return 0; // Folder does not exist
    }
}

void createSubFolders(const char *folder_name)
{
    char newsessionname[BUFFER_SIZE];
    int folderchecker = 0;

    char str[BUFFER_SIZE];
    strncpy(str, "biases,darks,flats,lights", sizeof(str));  //you make sure they do not have spaces in their names!
    str[sizeof(str) - 1] = '\0'; // Ensure null-termination

    char *token = strtok(str, ",");
    while (token != NULL)
    {
        snprintf(newsessionname, sizeof(newsessionname), "%s/%s", folder_name, token);
        folderchecker = folder_exists(newsessionname);
        if (folderchecker == 0)
        {
            createFolder(newsessionname);
        }
        token = strtok(NULL, ",");
    }
}

void createFolder(const char *folder_name) {
    // Create the new folder
    if (mkdir(folder_name, 0777) == -1) {
        perror("Error creating directory");
    } else {
        // going stealthy
        // printf("Directory created: %s\n", folder_name);
    }
}

int saveArray(char *shellstatements[], const char *filename) {
    FILE *fp = fopen(filename, "w");
    if (!fp) {
        perror("fopen");
        return 0;
    }

    // Write each non-NULL string to the file
    for (int i = 0; shellstatements[i] != NULL; i++) {
        fprintf(fp, "%s\n", shellstatements[i]);
    }

    fclose(fp);

    // If filename ends with ".sh", make it executable
    size_t len = strlen(filename);
    if (len >= 3 && strcmp(filename + len - 3, ".sh") == 0) {
        if (chmod(filename, 0755) != 0) {
            perror("chmod");
            return 0;
        }
    }

    return 1;
}

int appendStringToArray(char *shellstatements[], int maxsize, const char *newString) {
    int i = 0;

    // Find first empty slot (NULL)
    while (i < maxsize && shellstatements[i] != NULL) {
        i++;
    }

    // If full, free the last element and reuse it
    if (i == maxsize) {
        i = maxsize - 1;
        free(shellstatements[i]);   // free old string
    }

    shellstatements[i] = strdup(newString);  // allocate and copy
    return 1;
}

// You must free the result if result is non-NULL.
char *str_replace(char *orig, char *rep, char *with) {
    char *result; // the return string
    char *ins;    // the next insert point
    char *tmp;    // varies
    int len_rep;  // length of rep (the string to remove)
    int len_with; // length of with (the string to replace rep with)
    int len_front; // distance between rep and end of last rep
    int count;    // number of replacements

    // sanity checks and initialization
    if (!orig || !rep)
        return NULL;
    len_rep = strlen(rep);
    if (len_rep == 0)
        return NULL; // empty rep causes infinite loop during count
    if (!with)
        with = "";
    len_with = strlen(with);

    // count the number of replacements needed
    ins = orig;
    for (count = 0; (tmp = strstr(ins, rep)); ++count) {
        ins = tmp + len_rep;
    }

    tmp = result = malloc(strlen(orig) + (len_with - len_rep) * count + 1);

    if (!result)
        return NULL;

    // first time through the loop, all the variable are set correctly
    // from here on,
    //    tmp points to the end of the result string
    //    ins points to the next occurrence of rep in orig
    //    orig points to the remainder of orig after "end of rep"
    while (count--) {
        ins = strstr(orig, rep);
        len_front = ins - orig;
        tmp = strncpy(tmp, orig, len_front) + len_front;
        tmp = strcpy(tmp, with) + len_with;
        orig += len_front + len_rep; // move to next "end of rep"
    }
    strcpy(tmp, orig);
    return result;
}

void createShellCopyScript(const char *folder_name)
{
    // change the next line if you are using a different shell
    static char *shellstatements[] = {"#!/bin/zsh", "clear", " "};
    char scriptname[BUFFER_SIZE];
    strncpy(scriptname, folder_name, sizeof(scriptname));
    int ends = EndsWith(scriptname, "/");
    if (ends == 0)
    {
        strcat(scriptname, "/");
    }

    char copy_dest[BUFFER_SIZE];
    strncpy(copy_dest, folder_name, sizeof(copy_dest));
    if (EndsWith(copy_dest, "/") == 0)
    {
        strcat(copy_dest, "/");
    }
    strcat(copy_dest, "lights/");

    char copy_source[BUFFER_SIZE];
    char copy_template[BUFFER_SIZE_LARGE];

    
    // yes, we are hard coding the source directory.
    // we are prepping for a later update when the source folder is passed via the command line
    // so for now, you will have to edit the copy script!
    
    strncpy(copy_template, "find '{src}' -name '*.fit' -exec cp {} '{dest}' \\;", sizeof(copy_template));
    
    // Edit the folder name to match your compute device!
    // Edit the folder name to match your compute device!
    // Edit the folder name to match your compute device!
    // editme
    strncpy(copy_source, "/Users/richbriere/astrophotography/myCaptures/M 94_sub/", sizeof(copy_source));
    if (EndsWith(copy_source, "/") == 0)
    {
        strcat(copy_source, "/");
    }

    strncpy(copy_template, str_replace(copy_template, "{src}", copy_source), sizeof(copy_template));
    strncpy(copy_template, str_replace(copy_template, "{dest}", copy_dest), sizeof(copy_template));

    appendStringToArray(shellstatements, MAXSIZE, copy_template);

    strcat(scriptname, "run_copyfrom_original.sh");
    saveArray(shellstatements, scriptname);
    printf("\nEdit the fit file copy script to reflect your actual source folder.\n");
    printf("Copy script: %s\n", scriptname);

    if (2 == 1)
    {
        printf("\n\n");
        for (int i = 0; i < MAXSIZE && shellstatements[i] != NULL; i++)
        {
            printf("%s\n", shellstatements[i]);
        }
    }

}

int EndsWith(const char *str, const char *suffix)
{
    if (!str || !suffix)
        return 0;
    size_t lenstr = strlen(str);
    size_t lensuffix = strlen(suffix);
    if (lensuffix >  lenstr)
        return 0;
    return strncmp(str + lenstr - lensuffix, suffix, lensuffix) == 0;
}

void usage(char *progname)
{
    printf("usage: %s new-astrophotography-folder-session-name (with no spaces)\n", progname ? progname : DEFAULT_PROGNAME);
    printf("       [a new session folder will be created in the CWD]\n");
    exit(EXIT_FAILURE);
}

// Returns the total whitespace characters in the string passed as an argument
int count_whitespace(char *string)
{
  // Find the length of the string (not including the null terminator)
  int length = strlen(string);

  // Keeps track of the running count of the number of whitespace characters,
  // initialized to zero because before we go through the string we haven't 
  // counted any characters yet
  int count = 0;
  
  // The loop will take the counter variable i from 0, 1, 2, ... length-1
  // with each iteration, which are the indexes of each char in the string.
  // We then use the isspace() function which returns true if the char it 
  // is passed is a whitespace character and false otherwise, and we pass 
  // it the character at the 'current index' i to check if it is a whitespace
  // character or not.  If it is, we increment the running count of 
  // whitespace characters.
  for (int i = 0; i < length; i++)
  {
    if (isspace(string[i]))
    {
      count++;
    }
  }

  // Return the count of the number of whitespace characters 
  return count;
}